const { Coupon, CouponUsage } = require('../models/coupon.model');
const { Wallet, WalletTransaction } = require('../models/wallet.model');
const Notification = require('../models/notification.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

// ---- Coupon Service ----
class CouponService {
  async create(data) { return Coupon.create(data); }
  async getAll({ shopId, search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (shopId) filter.shop = shopId;
    if (search) filter.code = { $regex: search, $options: 'i' };
    const [coupons, total] = await Promise.all([Coupon.find(filter).skip((page - 1) * limit).limit(+limit).sort('-createdAt'), Coupon.countDocuments(filter)]);
    return { coupons, ...paginate(page, limit, total) };
  }
  async getById(id) {
    const c = await Coupon.findById(id);
    if (!c) throw err('Coupon not found', 404);
    return c;
  }
  async update(id, data) {
    const c = await Coupon.findByIdAndUpdate(id, data, { new: true });
    if (!c) throw err('Coupon not found', 404);
    return c;
  }
  async delete(id) { if (!await Coupon.findByIdAndDelete(id)) throw err('Coupon not found', 404); }
  async toggleStatus(id) {
    const c = await Coupon.findById(id);
    if (!c) throw err('Coupon not found', 404);
    c.isActive = !c.isActive;
    return c.save();
  }
}

// ---- Wallet Service ----
class WalletService {
  async getWallet(userId) {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });
    return wallet;
  }
  async getHistory(userId, { page = 1, limit = 15 } = {}) {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return { transactions: [], ...paginate(page, limit, 0) };
    const filter = { wallet: wallet._id };
    const [transactions, total] = await Promise.all([WalletTransaction.find(filter).populate('order', '_id').skip((page - 1) * limit).limit(+limit).sort('-createdAt'), WalletTransaction.countDocuments(filter)]);
    return { transactions, wallet, ...paginate(page, limit, total) };
  }
  async addBalance(userId, amount, description = 'Admin credit', adminId) {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });
    wallet.balance = parseFloat((wallet.balance + amount).toFixed(2));
    await wallet.save();
    await WalletTransaction.create({ wallet: wallet._id, user: userId, type: 'credit', amount, description, balanceAfter: wallet.balance });
    await Notification.create({ user: userId, title: 'Wallet Credited 💰', message: `₹${amount} added to your wallet. Balance: ₹${wallet.balance}`, type: 'wallet' });
    return wallet;
  }
  async getAllWallets({ page = 1, limit = 20 } = {}) {
    const [wallets, total] = await Promise.all([Wallet.find().populate('user', 'name email').skip((page - 1) * limit).limit(+limit).sort('-balance'), Wallet.countDocuments()]);
    return { wallets, ...paginate(page, limit, total) };
  }
}

// ---- Notification Service ----
class NotificationService {
  async getAll(userId, { page = 1, limit = 20 } = {}) {
    const filter = { $or: [{ user: userId }, { isBroadcast: true }] };
    const [notifications, total] = await Promise.all([Notification.find(filter).skip((page - 1) * limit).limit(+limit).sort('-createdAt'), Notification.countDocuments(filter)]);
    return { notifications, ...paginate(page, limit, total) };
  }
  async getUnreadCount(userId) {
    return Notification.countDocuments({ $or: [{ user: userId }, { isBroadcast: true }], read: false });
  }
  async markRead(id, userId) {
    return Notification.findOneAndUpdate({ _id: id, $or: [{ user: userId }, { isBroadcast: true }] }, { read: true }, { new: true });
  }
  async markAllRead(userId) {
    return Notification.updateMany({ $or: [{ user: userId }, { isBroadcast: true }], read: false }, { read: true });
  }
  async broadcast(title, message, type = 'general') {
    return Notification.create({ title, message, type, isBroadcast: true });
  }
  async getAll_Admin({ page = 1, limit = 20 } = {}) {
    const [notifications, total] = await Promise.all([Notification.find().populate('user', 'name email').skip((page - 1) * limit).limit(+limit).sort('-createdAt'), Notification.countDocuments()]);
    return { notifications, ...paginate(page, limit, total) };
  }
}

// ---- Analytics Service ----
class AnalyticsService {
  async getDashboard() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

    const [todaySales, weeklySales, monthlySales, totalOrders, totalCustomers, pendingOrders] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthAgo }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ status: 'pending' }),
    ]);

    // Sales by day (last 7 days)
    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top items
    const topItems = await Order.aggregate([
      { $match: { createdAt: { $gte: monthAgo } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.offerPrice', '$items.quantity'] } } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]);

    return {
      today: { sales: todaySales[0]?.total || 0, orders: todaySales[0]?.count || 0 },
      weekly: { sales: weeklySales[0]?.total || 0, orders: weeklySales[0]?.count || 0 },
      monthly: { sales: monthlySales[0]?.total || 0, orders: monthlySales[0]?.count || 0 },
      totalOrders, totalCustomers, pendingOrders,
      salesByDay, topItems,
    };
  }

  async getCustomerSummary(userId) {
    const [orders, totalSpent, walletBalance] = await Promise.all([
      Order.countDocuments({ customer: userId }),
      Order.aggregate([{ $match: { customer: userId, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      require('../models/wallet.model').Wallet.findOne({ user: userId }),
    ]);
    return { totalOrders: orders, totalSpent: totalSpent[0]?.total || 0, walletBalance: walletBalance?.balance || 0 };
  }
}

module.exports = {
  couponService: new CouponService(),
  walletService: new WalletService(),
  notificationService: new NotificationService(),
  analyticsService: new AnalyticsService(),
};
