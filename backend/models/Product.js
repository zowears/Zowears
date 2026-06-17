import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
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

export default mongoose.model('Product', productSchema);
