import { Router } from 'express';
import Visit from '../models/Visit.js';
import Product from '../models/Product.js';
import VisitorSession from '../models/VisitorSession.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import auth from '../middleware/auth.js';

const router = Router();

// Device parser helper
function detectDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

// Traffic Source Classifier helper
function classifySource(utmSource, referrer = '') {
  if (utmSource && utmSource.trim()) {
    const s = utmSource.toLowerCase().trim();
    if (s.includes('fb') || s.includes('facebook') || s.includes('meta') || s.includes('ig') || s.includes('instagram')) return 'Meta / Instagram';
    if (s.includes('google')) return 'Google Ads';
    if (s.includes('tiktok')) return 'TikTok';
    if (s.includes('whatsapp')) return 'WhatsApp';
    return utmSource;
  }

  if (!referrer || referrer.trim() === '') return 'Direct';

  const ref = referrer.toLowerCase();
  if (ref.includes('facebook.com') || ref.includes('instagram.com') || ref.includes('fb.com')) return 'Meta / Instagram (Organic)';
  if (ref.includes('google.com')) return 'Google (Organic)';
  if (ref.includes('whatsapp') || ref.includes('api.whatsapp.com')) return 'WhatsApp';
  if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('youtube.com')) return 'YouTube';
  if (ref.includes('pinterest.com')) return 'Pinterest';

  try {
    const host = new URL(referrer).hostname;
    return `Referral (${host})`;
  } catch {
    return 'Referral';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Endpoints (kept for 100% backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/visit', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    let visit = await Visit.findOne({ ip });
    if (visit) {
      visit.lastVisit = Date.now();
      visit.userAgent = userAgent;
      await visit.save();
    } else {
      visit = new Visit({ ip, userAgent });
      await visit.save();
    }
    res.status(200).json({ success: true, message: 'Visit recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });
    res.status(200).json({ success: true, message: 'Product view incremented' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Ingest First-Party Analytics Event & Heartbeat
// ─────────────────────────────────────────────────────────────────────────────
router.post('/event', async (req, res) => {
  try {
    const {
      eventName,
      eventId,
      visitorId,
      sessionId,
      path = '/',
      referrer = '',
      utmParams = {},
      payload = {},
    } = req.body;

    if (!visitorId || !sessionId) {
      return res.status(400).json({ error: 'visitorId and sessionId are required' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const device = detectDevice(userAgent);
    const source = classifySource(utmParams.utm_source, referrer);

    // 1. Log Granular Event (if not a pure heartbeat ping)
    if (eventName && eventName !== 'session_ping') {
      await AnalyticsEvent.create({
        eventName,
        eventId,
        visitorId,
        sessionId,
        path,
        referrer,
        payload,
        timestamp: new Date(),
      }).catch((e) => console.error('[Analytics Event Write Warn]:', e.message));
    }

    // 2. Upsert Visitor Session
    let session = await VisitorSession.findOne({ sessionId });
    const now = new Date();

    if (!session) {
      session = new VisitorSession({
        sessionId,
        visitorId,
        ip,
        userAgent,
        device,
        referrer,
        utmSource: source,
        utmMedium: utmParams.utm_medium || '',
        utmCampaign: utmParams.utm_campaign || '',
        landingPage: path,
        lastPath: path,
        pageViews: 1,
        funnelStage: 'viewed',
        firstSeen: now,
        lastActive: now,
      });
    } else {
      session.lastActive = now;
      session.lastPath = path;
      if (eventName === 'PageView') {
        session.pageViews = (session.pageViews || 1) + 1;
      }
    }

    // 3. Funnel Progression Updates
    if (eventName === 'ViewContent') {
      if (session.funnelStage === 'viewed') {
        session.funnelStage = 'viewed';
      }
    } else if (eventName === 'AddToCart') {
      session.funnelStage = 'added_to_cart';
      if (payload.contents?.[0]) {
        const item = payload.contents[0];
        session.cartItems.push({
          productId: item.id,
          name: payload.content_name || 'Item',
          price: item.item_price || payload.value,
          qty: item.quantity || 1,
        });
      }
      session.cartValue = (session.cartValue || 0) + (payload.value || 0);
    } else if (eventName === 'InitiateCheckout') {
      if (session.funnelStage !== 'purchased') {
        session.funnelStage = 'checkout_initiated';
      }
      if (payload.value) session.cartValue = payload.value;
    } else if (eventName === 'Purchase') {
      session.funnelStage = 'purchased';
      session.converted = true;
      session.orderId = payload.order_id || null;
      session.orderRevenue = payload.value || session.cartValue || 0;
    }

    await session.save();

    res.status(200).json({ success: true, sessionId, funnelStage: session.funnelStage });
  } catch (error) {
    console.error('[Analytics Ingest Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Analytics Dashboard Stats (Shopify-Level)
// Protected with admin auth
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'all') {
      startDate = new Date(0); // Beginning of time
    }

    const dateFilter = { createdAt: { $gte: startDate } };
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Run parallel aggregation queries
    const [
      totalSessions,
      uniqueVisitors,
      liveVisitors,
      funnelCounts,
      trafficSources,
      topViewedProducts,
      abandonedSessions,
      revenueStats,
      timelineStats,
    ] = await Promise.all([
      // Total visits in range
      VisitorSession.countDocuments(dateFilter),

      // Unique visitors in range
      VisitorSession.distinct('visitorId', dateFilter).then((ids) => ids.length),

      // Live active visitors (active in last 5 minutes)
      VisitorSession.countDocuments({ lastActive: { $gte: fiveMinutesAgo } }),

      // eCommerce Funnel counts
      VisitorSession.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$funnelStage',
            count: { $sum: 1 },
            totalValue: { $sum: '$cartValue' },
          },
        },
      ]),

      // Revenue and Sessions by Traffic Source (UTM / Referrer)
      VisitorSession.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$utmSource',
            sessions: { $sum: 1 },
            conversions: { $sum: { $cond: ['$converted', 1, 0] } },
            revenue: { $sum: '$orderRevenue' },
          },
        },
        { $sort: { revenue: -1, sessions: -1 } },
        { $limit: 10 },
      ]),

      // Top Viewed Products from Product collection
      Product.find({ status: 'active' })
        .sort({ views: -1 })
        .limit(8)
        .select('name image price views category')
        .lean(),

      // Abandoned Carts (sessions that added to cart or initiated checkout but did NOT purchase)
      VisitorSession.find({
        ...dateFilter,
        funnelStage: { $in: ['added_to_cart', 'checkout_initiated'] },
        converted: false,
        cartValue: { $gt: 0 },
      })
        .sort({ lastActive: -1 })
        .limit(10)
        .select('sessionId visitorId cartValue cartItems utmSource device lastActive createdAt')
        .lean(),

      // Total Tracked Revenue & Completed Orders
      VisitorSession.aggregate([
        { $match: { ...dateFilter, converted: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$orderRevenue' },
            orderCount: { $sum: 1 },
          },
        },
      ]),

      // Daily sessions timeline for chart
      VisitorSession.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            visits: { $sum: 1 },
            orders: { $sum: { $cond: ['$converted', 1, 0] } },
            revenue: { $sum: '$orderRevenue' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Map Funnel stages
    const funnelMap = {};
    funnelCounts.forEach((f) => {
      funnelMap[f._id] = f.count;
    });

    const viewed = totalSessions || 0;
    const addedToCart =
      (funnelMap['added_to_cart'] || 0) +
      (funnelMap['checkout_initiated'] || 0) +
      (funnelMap['purchased'] || 0);
    const checkoutInitiated =
      (funnelMap['checkout_initiated'] || 0) + (funnelMap['purchased'] || 0);
    const purchased = funnelMap['purchased'] || 0;

    const conversionRate = viewed > 0 ? ((purchased / viewed) * 100).toFixed(2) : '0.00';
    const cartToCheckoutRate = addedToCart > 0 ? ((checkoutInitiated / addedToCart) * 100).toFixed(1) : '0.0';
    const checkoutToPurchaseRate = checkoutInitiated > 0 ? ((purchased / checkoutInitiated) * 100).toFixed(1) : '0.0';

    const abandonedCount = (funnelMap['added_to_cart'] || 0) + (funnelMap['checkout_initiated'] || 0);
    const abandonedRate = addedToCart > 0 ? (((addedToCart - purchased) / addedToCart) * 100).toFixed(1) : '0.0';

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const totalOrders = revenueStats[0]?.orderCount || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.status(200).json({
      success: true,
      range,
      kpis: {
        totalSessions,
        uniqueVisitors,
        liveVisitors,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        conversionRate: parseFloat(conversionRate),
        abandonedRate: parseFloat(abandonedRate),
        abandonedCount,
      },
      funnel: [
        {
          step: 1,
          name: 'Store Visits',
          count: viewed,
          dropOffPercent: viewed > 0 ? (100 - (addedToCart / viewed) * 100).toFixed(1) : 0,
        },
        {
          step: 2,
          name: 'Added to Cart',
          count: addedToCart,
          conversionFromPrev: viewed > 0 ? ((addedToCart / viewed) * 100).toFixed(1) : 0,
          dropOffPercent: addedToCart > 0 ? (100 - (checkoutInitiated / addedToCart) * 100).toFixed(1) : 0,
        },
        {
          step: 3,
          name: 'Initiated Checkout',
          count: checkoutInitiated,
          conversionFromPrev: cartToCheckoutRate,
          dropOffPercent: checkoutInitiated > 0 ? (100 - (purchased / checkoutInitiated) * 100).toFixed(1) : 0,
        },
        {
          step: 4,
          name: 'Completed Purchase',
          count: purchased,
          conversionFromPrev: checkoutToPurchaseRate,
          dropOffPercent: 0,
        },
      ],
      trafficSources: trafficSources.map((ts) => ({
        source: ts._id || 'Direct',
        sessions: ts.sessions,
        conversions: ts.conversions,
        revenue: ts.revenue,
        conversionRate: ts.sessions > 0 ? ((ts.conversions / ts.sessions) * 100).toFixed(2) : '0.00',
      })),
      topViewedProducts,
      abandonedCarts: abandonedSessions,
      timeline: timelineStats.map((t) => ({
        date: t._id,
        visits: t.visits,
        orders: t.orders,
        revenue: t.revenue,
      })),
    });
  } catch (error) {
    console.error('[Admin Analytics Stats Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
