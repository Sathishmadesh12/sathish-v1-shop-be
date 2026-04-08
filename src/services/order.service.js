const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Inventory = require('../models/inventory.model');
const Payment = require('../models/payment.model');
const { Coupon, CouponUsage } = require('../models/coupon.model');
const { Wallet, WalletTransaction } = require('../models/wallet.model');
const Notification = require('../models/notification.model');
const { sendEmail } = require('../config/email');
const { orderConfirmEmail } = require('../utils/emailTemplates');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class OrderService {
  async create(userId, { paymentMethod, notes, transactionRef }) {
    const cart = await Cart.findOne({ customer: userId }).populate('items.item');
    if (!cart || !cart.items?.length) throw err('Cart is empty');

    // Verify stock
    for (const ci of cart.items) {
      const inv = await Inventory.findOne({ item: ci.item._id });
      if (inv && inv.stock < ci.quantity) throw err(`Insufficient stock for ${ci.item.name}`);
    }

    const orderItems = cart.items.map(ci => ({
      item: ci.item._id,
      name: ci.item.name,
      quantity: ci.quantity,
      price: ci.price,
      offerPrice: ci.offerPrice,
    }));

    const order = await Order.create({
      customer: userId,
      shop: cart.shop,
      items: orderItems,
      coupon: cart.coupon,
      couponCode: cart.couponCode,
      subtotal: cart.subtotal,
      discount: cart.discount,
      walletDeduction: cart.walletDeduction,
      tax: cart.tax,
      total: cart.total,
      paymentMethod,
      notes,
      transactionRef,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Deduct stock
    for (const ci of cart.items) {
      await Inventory.findOneAndUpdate({ item: ci.item._id }, {
        $inc: { stock: -ci.quantity },
        $push: { history: { action: 'deduct', qty: ci.quantity, note: `Order #${String(order._id).slice(-8)}`, date: new Date() } },
      });
    }

    // Wallet deduction
    if (cart.walletDeduction > 0) {
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        wallet.balance = parseFloat((wallet.balance - cart.walletDeduction).toFixed(2));
        await wallet.save();
        await WalletTransaction.create({ wallet: wallet._id, user: userId, type: 'debit', amount: cart.walletDeduction, description: `Order #${String(order._id).slice(-8)}`, order: order._id, balanceAfter: wallet.balance });
      }
    }

    // Mark coupon used
    if (cart.coupon) {
      await CouponUsage.create({ coupon: cart.coupon, user: userId, order: order._id, discount: cart.discount });
      await Coupon.findByIdAndUpdate(cart.coupon, { $inc: { usedCount: 1 } });
    }

    // Payment record
    await Payment.create({ order: order._id, customer: userId, amount: order.total, method: paymentMethod, transactionRef, status: paymentMethod === 'cash' ? 'pending' : 'paid' });

    // Clear cart
    await Cart.findOneAndUpdate({ customer: userId }, { items: [], coupon: null, couponCode: null, useWallet: false, subtotal: 0, discount: 0, walletDeduction: 0, tax: 0, total: 0 });

    // Notification
    await Notification.create({ user: userId, title: 'Order Placed ✅', message: `Your order #${String(order._id).slice(-8).toUpperCase()} has been placed`, type: 'order', data: { orderId: order._id } });

    // Email
    const { User } = require('../models/user.model');
    const user = await require('../models/user.model').findById(userId);
    if (user) sendEmail({ to: user.email, subject: 'Order Confirmed', html: orderConfirmEmail(user.name, order) }).catch(() => {});

    return order;
  }

  async getAll(userId, role, { page = 1, limit = 10, status, from, to } = {}) {
    const filter = role === 'admin' ? {} : { customer: userId };
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('customer', 'name email').populate('shop', 'name').skip((page - 1) * limit).limit(+limit).sort('-createdAt'),
      Order.countDocuments(filter),
    ]);
    return { orders, ...paginate(page, limit, total) };
  }

  async getById(id, userId, role) {
    const filter = { _id: id };
    if (role !== 'admin') filter.customer = userId;
    const order = await Order.findOne(filter).populate('customer', 'name email phone').populate('shop', 'name address phone email').populate('items.item', 'name image');
    if (!order) throw err('Order not found', 404);
    return order;
  }

  async updateStatus(id, status, note, adminId) {
    const order = await Order.findById(id);
    if (!order) throw err('Order not found', 404);
    order.status = status;
    order.statusHistory.push({ status, note, updatedBy: adminId, at: new Date() });
    if (status === 'completed') {
      await Payment.findOneAndUpdate({ order: id }, { status: 'paid' });
    }
    await order.save();
    await Notification.create({ user: order.customer, title: `Order ${status}`, message: `Your order #${String(order._id).slice(-8).toUpperCase()} is now ${status}`, type: 'order' });
    return order;
  }
}

module.exports = new OrderService();
