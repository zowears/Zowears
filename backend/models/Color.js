import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  hexCode: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true, 
    index: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
});

export default mongoose.model('Color', colorSchema);
