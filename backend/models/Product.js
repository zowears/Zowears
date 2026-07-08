import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, unique: true, sparse: true, index: true },
  jp: { type: String },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, index: true },
  compareAt: { type: Number },
  image: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, text: true },
  stock: { type: Number, default: 0, index: true },
  badge: { type: String },
  isFeatured: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Create compound index for common queries
productSchema.index({ category: 1, isFeatured: 1 });
productSchema.index({ name: "text", description: "text", jp: "text" }, { default_language: "english" });

// Auto-generate slug from name before saving
productSchema.pre('save', async function () {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

export default mongoose.model('Product', productSchema);
