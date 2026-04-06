const mongoose = require('mongoose');
const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['hotel', 'dress_shop', 'retail', 'other'], default: 'retail' },
  description: String,
  logo: String,
  address: String,
  phone: String,
  email: String,
  paymentQr: String,
  gstin: String,
  taxRate: { type: Number, default: 0 },
  taxName: { type: String, default: 'GST' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Shop', shopSchema);
