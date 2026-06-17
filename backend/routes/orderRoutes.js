import { Router } from 'express';
const router = Router();
import Order from '../models/Order.js';
import { sendOrderConfirmationEmail } from '../utils/mail.js';
import { sendWhatsAppOrderConfirmation } from '../utils/whatsapp.js';

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    const newOrder = await order.save();
    
    // Send email confirmation
    const emailResult = await sendOrderConfirmationEmail(newOrder);
    
    // Send WhatsApp confirmation
    const whatsappResult = await sendWhatsAppOrderConfirmation(newOrder);
    
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

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
