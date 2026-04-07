const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    code: { type: String, required: true, uppercase: true, unique: true },
    type: { type: String, enum: ["percentage", "flat"], default: "percentage" },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    totalLimit: { type: Number, default: 100 },
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    discount: Number,
  },
  { timestamps: true },
);

module.exports = {
  Coupon: mongoose.model("Coupon", couponSchema),
  CouponUsage: mongoose.model("CouponUsage", couponUsageSchema),
};
