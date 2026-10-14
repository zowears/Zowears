import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    index: true,
  },
  eventId: {
    type: String,
    index: true,
  },
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  path: {
    type: String,
    default: '/',
  },
  referrer: {
    type: String,
    default: '',
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

// Compound indexes
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, eventName: 1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema);
