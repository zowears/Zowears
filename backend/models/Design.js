import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 1 },
  image1: { type: String, required: true },
  image2: { type: String, required: true },
  stitchCount: { type: Number, required: true },
  totalColors: { type: Number, required: true },
  size: { type: String, required: true }, // e.g., "4x4 inches"
  designType: { type: String, default: 'Flat' }, // Flat, 3D Puff, Appliqué, etc.
  threadType: { type: String, default: 'Polyester' },
  fabricType: { type: String, default: 'All Fabrics' },
  formats: { type: [String], default: ['DST', 'PES', 'JEF', 'XXX', 'VP3', 'HUS', 'EXP'] },
  driveLink: { type: String, required: true }, // Google Drive download link
  category: { type: String, default: 'General' },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Draft'], default: 'Active' },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Design', designSchema);
