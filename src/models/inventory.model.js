const mongoose = require('mongoose');
const inventorySchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, unique: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  history: [{
    action: { type: String, enum: ['add', 'deduct', 'adjust'] },
    qty: Number,
    note: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
module.exports = mongoose.model('Inventory', inventorySchema);
