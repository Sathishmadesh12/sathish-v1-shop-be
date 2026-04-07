const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true, trim: true },
  description: String,
  image: String,
  price: { type: Number, required: true, min: 0 },
  offer: { type: Number, default: 0, min: 0, max: 100 },
  offerPrice: Number,
  minQty: { type: Number, default: 1 },
  maxQty: { type: Number, default: 100 },
  unit: { type: String, default: 'piece' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

itemSchema.pre('save', function (next) {
  this.offerPrice = this.offer > 0
    ? parseFloat((this.price - (this.price * this.offer) / 100).toFixed(2))
    : this.price;
  next();
});

module.exports = mongoose.model('Item', itemSchema);
