import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, text: true },
  price: { type: Number, default: 1, index: true },
  image1: { type: String, required: true },
  image2: { type: String, required: true },
  stitchCount: { type: Number, required: true },
  totalColors: { type: Number, required: true },
  size: { type: String, required: true }, // e.g., "4x4 inches"
  designType: { type: String, default: 'Flat', index: true }, // Flat, 3D Puff, Appliqué, etc.
  threadType: { type: String, default: 'Polyester' },
  fabricType: { type: String, default: 'All Fabrics' },
  formats: { type: [String], default: ['DST', 'PES', 'JEF', 'XXX', 'VP3', 'HUS', 'EXP'] },
  driveLink: { type: String, required: true }, // Google Drive download link
  category: { type: String, default: 'General', index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['Active', 'Draft'], default: 'Active', index: true },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Create text index for search
designSchema.index({ name: "text", description: "text", designType: "text" }, { default_language: "english" });
// Create compound index for common queries
designSchema.index({ category: 1, isFeatured: 1 });
designSchema.index({ status: 1, isFeatured: 1 });

export default mongoose.model('Design', designSchema);
