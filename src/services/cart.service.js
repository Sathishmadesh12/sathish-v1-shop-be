const Cart = require('../models/cart.model');
const Item = require('../models/item.model');
const Inventory = require('../models/inventory.model');
const { Coupon, CouponUsage } = require('../models/coupon.model');
const { Wallet } = require('../models/wallet.model');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class CartService {
  async _recalc(cart) {
    let sub = 0;
    for (const ci of cart.items) {
      const price = ci.offerPrice || ci.price || 0;
      sub += price * ci.quantity;
    }
    cart.subtotal = parseFloat(sub.toFixed(2));
    cart.discount = 0;
    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon?.isActive) {
        if (coupon.type === 'percentage') {
          cart.discount = parseFloat(((sub * coupon.value) / 100).toFixed(2));
          if (coupon.maxDiscount) cart.discount = Math.min(cart.discount, coupon.maxDiscount);
        } else {
          cart.discount = Math.min(coupon.value, sub);
        }
      }
    }
    const wallet = await Wallet.findOne({ user: cart.customer });
    cart.walletBalance = wallet?.balance || 0;
    const afterDiscount = sub - cart.discount;
    cart.walletDeduction = cart.useWallet ? Math.min(wallet?.balance || 0, afterDiscount) : 0;
    cart.total = parseFloat(Math.max(0, afterDiscount - cart.walletDeduction + cart.tax).toFixed(2));
    return cart;
  }

  async getCart(userId) {
    let cart = await Cart.findOne({ customer: userId }).populate({ path: 'items.item', populate: { path: 'category', select: 'name' } });
    if (!cart) cart = await Cart.create({ customer: userId, items: [] });
    const wallet = await Wallet.findOne({ user: userId });
    cart.walletBalance = wallet?.balance || 0;
    return cart;
  }

  async addItem(userId, itemId, quantity = 1) {
    const item = await Item.findById(itemId);
    if (!item || !item.isActive) throw err('Item not available', 404);
    const inv = await Inventory.findOne({ item: itemId });
    // if (inv && inv.stock < quantity) throw err('Insufficient stock');

    let cart = await Cart.findOne({ customer: userId });
    if (!cart) cart = await Cart.create({ customer: userId, items: [], shop: item.shop });

    const existing = cart.items.find(i => i.item.toString() === itemId);
    if (existing) existing.quantity += quantity;
    else cart.items.push({ item: itemId, quantity, price: item.price, offerPrice: item.offerPrice });

    await this._recalc(cart);
    await cart.save();
    return this.getCart(userId);
  }

  async updateItem(userId, cartItemId, quantity) {
    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw err('Cart not found', 404);
    const ci = cart.items.id(cartItemId);
    if (!ci) throw err('Cart item not found', 404);
    if (quantity < 1) {
      ci.remove();
    } else {
      const inv = await Inventory.findOne({ item: ci.item });
      // if (inv && inv.stock < quantity) throw err('Insufficient stock');
      ci.quantity = quantity;
    }
    await this._recalc(cart);
    await cart.save();
    return this.getCart(userId);
  }

  async removeItem(userId, cartItemId) {
    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw err('Cart not found', 404);
    cart.items = cart.items.filter(i => i._id.toString() !== cartItemId);
    await this._recalc(cart);
    await cart.save();
    return this.getCart(userId);
  }

  async applyCoupon(userId, code) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw err('Invalid or expired coupon');
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) throw err('Coupon expired');
    if (coupon.usedCount >= coupon.totalLimit) throw err('Coupon limit reached');
    const usageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId });
    if (usageCount >= coupon.perUserLimit) throw err('You have already used this coupon');

    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw err('Cart not found', 404);
    if (cart.subtotal < coupon.minOrderAmount) throw err(`Minimum order ₹${coupon.minOrderAmount} required`);

    cart.coupon = coupon._id;
    cart.couponCode = coupon.code;
    await this._recalc(cart);
    await cart.save();
    return this.getCart(userId);
  }

  async removeCoupon(userId) {
    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw err('Cart not found', 404);
    cart.coupon = null;
    cart.couponCode = null;
    await this._recalc(cart);
    await cart.save();
    return this.getCart(userId);
  }

  async toggleWallet(userId, use) {
    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw err('Cart not found', 404);
    cart.useWallet = use;
    await this._recalc(cart);
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId) {
    await Cart.findOneAndUpdate({ customer: userId }, { items: [], coupon: null, couponCode: null, useWallet: false, subtotal: 0, discount: 0, walletDeduction: 0, tax: 0, total: 0 });
  }
}

module.exports = new CartService();
