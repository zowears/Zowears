import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  ip: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  lastVisit: { 
    type: Date, 
    default: Date.now 
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Visit', visitSchema);
