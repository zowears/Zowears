import { Router } from 'express';
const router = Router();
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../utils/mail.js';
import { sendWhatsAppOrderConfirmation } from '../utils/whatsapp.js';
import { sendMetaEvent } from '../utils/meta.js';
import auth from '../middleware/auth.js';

// Get all orders with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    const query = status ? { status } : {};
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Order.countDocuments(query)
    ]);
    
    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name price image')
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    const newOrder = await order.save();
    
    // Update product sales statistics
    for (const item of newOrder.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            totalSold: item.quantity,
            totalRevenue: item.quantity * item.price
          }
        }
      );
    }
    
    // Send email confirmation
    const emailResult = await sendOrderConfirmationEmail(newOrder);
    
    // Send WhatsApp confirmation
    const whatsappResult = await sendWhatsAppOrderConfirmation(newOrder);
    
    // Send Meta CAPI Purchase event
    // Using the request IP and User Agent, and order details
    sendMetaEvent('Purchase', newOrder._id.toString(), {
      email: newOrder.email,
      phone: newOrder.shippingAddress?.phone,
      firstName: newOrder.shippingAddress?.firstName,
      lastName: newOrder.shippingAddress?.lastName,
      clientIp: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      clientUserAgent: req.headers['user-agent']
    }, {
      content_ids: newOrder.items.map(item => item.productId.toString()),
      content_type: 'product',
      value: newOrder.totalAmount,
      currency: 'PKR'
    });

    
    res.status(201).json({
      ...newOrder.toObject(),
      emailSent: emailResult.success,
      emailPreviewUrl: emailResult.previewUrl || null,
      emailHtml: emailResult.html || null,
      whatsappSent: whatsappResult.success,
      whatsappProvider: whatsappResult.provider || null,
      whatsappError: whatsappResult.error || null
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status with automatic revenue tracking
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const oldStatus = order.status;
    
    // Update order with new status
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    // Automatically set timestamps based on status
    if (status === 'confirmed' && !order.confirmedAt) {
      order.confirmedAt = Date.now();
    } else if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = Date.now();
    } else if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = Date.now();
      // Mark payment as paid when delivered
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
      }
    } else if (status === 'cancelled' && !order.cancelledAt) {
      order.cancelledAt = Date.now();
      // Revert product sales if order was completed
      if (['delivered', 'completed'].includes(oldStatus)) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            {
              $inc: {
                totalSold: -item.quantity,
                totalRevenue: -(item.quantity * item.price)
              }
            }
          );
        }
      }
    } else if (status === 'refunded' && !order.refundedAt) {
      order.refundedAt = Date.now();
      order.paymentStatus = 'refunded';
      // Revert product sales
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              totalSold: -item.quantity,
              totalRevenue: -(item.quantity * item.price)
            }
          }
        );
      }
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order statistics
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] }
          }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
