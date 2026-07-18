import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Visit from '../models/Visit.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get dashboard KPIs - Admin only
router.get('/kpis', auth, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      orderStats,
      monthlyRevenue,
      totalVisitors
    ] = await Promise.all([
      // Total Revenue - Only from delivered/completed orders
      Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),

      // Total Orders Count
      Order.countDocuments(),

      // Total Unique Customers
      Order.distinct('email').then(emails => emails.length),

      // Total Products
      Product.countDocuments({ status: 'active' }),

      // Low Stock Products (below threshold)
      Product.find({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        status: 'active'
      })
        .select('name sku stock lowStockThreshold')
        .limit(10)
        .lean(),

      // Recent Orders (last 5)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id customerName totalAmount status createdAt')
        .lean(),

      // Order Status Breakdown
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Monthly Revenue
      Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'completed'] },
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Total Visitors
      Visit.countDocuments()
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const monthRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    // Format order stats
    const formattedOrderStats = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };

    orderStats.forEach(stat => {
      formattedOrderStats[stat._id] = stat.count;
    });

    res.json({
      revenue,
      monthlyRevenue: monthRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      orderStats: formattedOrderStats,
      topStats: {
        totalRevenue: revenue,
        averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
        customerCount: totalCustomers,
        productCount: totalProducts,
        lowStockCount: lowStockProducts.length,
        totalVisitors: totalVisitors
      }
    });
  } catch (error) {
    console.error('Dashboard KPI error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get revenue chart data
router.get('/charts/revenue', auth, async (req, res) => {
  try {
    const period = req.query.period || 'daily'; // daily, weekly, monthly, yearly
    const days = req.query.days || 30;

    const startDate = new Date();
    if (period === 'daily') startDate.setDate(startDate.getDate() - (days || 30));
    if (period === 'weekly') startDate.setDate(startDate.getDate() - (days * 7 || 90));
    if (period === 'monthly') startDate.setMonth(startDate.getMonth() - (days || 12));

    const data = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'completed'] },
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders chart data
router.get('/charts/orders', auth, async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const days = req.query.days || 30;

    const startDate = new Date();
    if (period === 'daily') startDate.setDate(startDate.getDate() - (days || 30));
    if (period === 'monthly') startDate.setMonth(startDate.getMonth() - (days || 12));

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top selling products
router.get('/charts/top-products', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'completed'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category performance
router.get('/charts/categories', auth, async (req, res) => {
  try {
    const categoryPerformance = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'completed'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          category: { $first: '$category' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: 1 },
          revenue: { $sum: '$product.price' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(categoryPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top viewed products
router.get('/charts/top-viewed-products', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topViewed = await Product.find({ views: { $gt: 0 } })
      .sort({ views: -1 })
      .limit(limit)
      .select('name views image price')
      .lean();

    res.json(topViewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
