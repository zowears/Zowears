import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    size: { type: String },
    color: { type: String },
    image: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true }
  },
  shippingMethod: { type: String, default: 'Standard' },
  shippingCost: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
