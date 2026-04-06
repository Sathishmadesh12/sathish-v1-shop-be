const mongoose = require("mongoose");
const cartItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: Number,
  offerPrice: Number,
});
const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    items: [cartItemSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    couponCode: String,
    useWallet: { type: Boolean, default: false },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    walletDeduction: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Cart", cartSchema);
