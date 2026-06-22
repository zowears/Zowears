import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  jp: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  compareAt: { type: Number },
  image: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String },
  stock: { type: Number, default: 0 },
  badge: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

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
