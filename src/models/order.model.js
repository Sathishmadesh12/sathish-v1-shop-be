const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  name: String,
  quantity: Number,
  price: Number,
  offerPrice: Number,
});
const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  items: [orderItemSchema],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: String,
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  walletDeduction: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'qr', 'upi'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  transactionRef: String,
  notes: String,
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);
