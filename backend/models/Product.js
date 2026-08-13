import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, index: true },
  slug: { type: String, unique: true, sparse: true, index: true },
  description: { type: String },
  sku: { type: String, unique: true, sparse: true, index: true },
  brand: { type: String },
  jp: { type: String },
  
  categories: [{ 
    type: String,
    index: true
  }],
  fits: [{
    type: String
  }],
  status: { 
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active',
    index: true
  },
  isFeatured: { type: Boolean, default: false, index: true },
  
  // Pricing
  costPrice: { type: Number, default: 0 },
  price: { type: Number, required: true, index: true },
  comparePrice: { type: Number },
  discountPercentage: { type: Number, default: 0 },
  
  // Inventory
  stock: { type: Number, default: 0, index: true },
  lowStockThreshold: { type: Number, default: 10 },
  trackInventory: { type: Boolean, default: true },
  
  // Variants
  colors: [{
    colorId: mongoose.Schema.Types.ObjectId,
    name: String,
    hexCode: String,
    sizes: [{ type: String }]
  }],
  sizes: [{ type: String }],
  
  // Images
  images: [{
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  }],
  image: { type: String }, // Primary image for backward compatibility
  badge: { type: String },
  
  // Analytics
  views: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate discount percentage before saving
productSchema.pre('save', async function () {
  if (this.comparePrice && this.price) {
    this.discountPercentage = Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100
    );
  }
  
  this.updatedAt = Date.now();
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

// Create indexes for common queries
productSchema.index({ categories: 1, isFeatured: 1 });
productSchema.index({ categories: 1, status: 1 });
productSchema.index({ stock: 1, lowStockThreshold: 1 });
productSchema.index({ name: "text", description: "text", jp: "text" }, { default_language: "english" });

export default mongoose.model('Product', productSchema);
