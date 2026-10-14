import mongoose from 'mongoose';

const visitorSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  ip: {
    type: String,
    default: 'unknown',
  },
  userAgent: {
    type: String,
    default: 'unknown',
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop',
  },
  country: {
    type: String,
    default: 'Pakistan',
  },
  referrer: {
    type: String,
    default: '',
  },
  utmSource: {
    type: String,
    default: 'Direct',
    index: true,
  },
  utmMedium: {
    type: String,
    default: '',
  },
  utmCampaign: {
    type: String,
    default: '',
  },
  landingPage: {
    type: String,
    default: '/',
  },
  lastPath: {
    type: String,
    default: '/',
  },
  pageViews: {
    type: Number,
    default: 1,
  },
  funnelStage: {
    type: String,
    enum: ['viewed', 'added_to_cart', 'checkout_initiated', 'purchased', 'abandoned'],
    default: 'viewed',
    index: true,
  },
  cartItems: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
      size: String,
      color: String,
    },
  ],
  cartValue: {
    type: Number,
    default: 0,
  },
  converted: {
    type: Boolean,
    default: false,
    index: true,
  },
  orderId: {
    type: String,
    default: null,
  },
  orderRevenue: {
    type: Number,
    default: 0,
  },
  firstSeen: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

// Compound indexes for rapid analytics aggregations
visitorSessionSchema.index({ lastActive: -1 });
visitorSessionSchema.index({ funnelStage: 1, createdAt: -1 });
visitorSessionSchema.index({ utmSource: 1, orderRevenue: -1 });

export default mongoose.models.VisitorSession || mongoose.model('VisitorSession', visitorSessionSchema);
