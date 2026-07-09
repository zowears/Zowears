import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String },
  
  // Order Items
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    image: { type: String }
  }],
  
  // Pricing
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // Shipping
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, default: 'Pakistan' }
  },
  shippingMethod: { type: String, default: 'Standard' },
  trackingNumber: { type: String },
  
  // Payment
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  refundedAt: { type: Date }
});

// Update timestamp and handle status changes
orderSchema.pre('save', async function () {
  this.updatedAt = Date.now();
  
  // Set status-specific timestamps
  if (this.isModified('status')) {
    switch (this.status) {
      case 'confirmed':
        this.confirmedAt = Date.now();
        break;
      case 'shipped':
        this.shippedAt = Date.now();
        break;
      case 'delivered':
        this.deliveredAt = Date.now();
        break;
      case 'cancelled':
        this.cancelledAt = Date.now();
        break;
      case 'refunded':
        this.refundedAt = Date.now();
        break;
    }
  }
});

// Indexes for common queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ email: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
