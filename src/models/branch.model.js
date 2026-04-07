const mongoose = require('mongoose');
const branchSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true },
  address: String,
  phone: String,
  manager: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Branch', branchSchema);
