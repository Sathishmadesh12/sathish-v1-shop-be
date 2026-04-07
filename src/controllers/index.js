const shopService = require("../services/shop.service");
const branchService = require("../services/branch.service");
const categoryService = require("../services/category.service");
const itemService = require("../services/item.service");
const inventoryService = require("../services/inventory.service");
const cartService = require("../services/cart.service");
const orderService = require("../services/order.service");
const {
  couponService,
  walletService,
  notificationService,
  analyticsService,
} = require("../services/other.service");
const { apiResponse } = require("../utils/apiResponse");

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    next(e);
  }
};
const q = (req) => ({ ...req.query, ...req.params });

// ---- SHOP ----
exports.shop = {
  create: wrap(async (req, res) => {
    const data = { ...req.body };
    if (req.files?.logo) data.logo = req.files.logo[0].path;
    if (req.files?.paymentQr) data.paymentQr = req.files.paymentQr[0].path;
    apiResponse(res, 201, true, "Shop created", await shopService.create(data));
  }),

  getAll: wrap(async (req, res) =>
    apiResponse(res, 200, true, "Shops", await shopService.getAll(req.query)),
  ),
  getById: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Shop",
      await shopService.getById(req.params.id),
    ),
  ),
  update: wrap(async (req, res) => {
    const data = { ...req.body };
    if (req.files?.logo) data.logo = req.files.logo[0].path;
    if (req.files?.paymentQr) data.paymentQr = req.files.paymentQr[0].path;
    apiResponse(
      res,
      200,
      true,
      "Shop updated",
      await shopService.update(req.params.id, data),
    );
  }),
  delete: wrap(async (req, res) => {
    await shopService.delete(req.params.id);
    apiResponse(res, 200, true, "Shop deleted");
  }),
  toggleStatus: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Status toggled",
      await shopService.toggleStatus(req.params.id),
    ),
  ),
};

// ---- BRANCH ----
exports.branch = {
  create: wrap(async (req, res) =>
    apiResponse(
      res,
      201,
      true,
      "Branch created",
      await branchService.create(req.body),
    ),
  ),
  getAll: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Branches",
      await branchService.getAll(req.query),
    ),
  ),
  getById: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Branch",
      await branchService.getById(req.params.id),
    ),
  ),
  update: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Branch updated",
      await branchService.update(req.params.id, req.body),
    ),
  ),
  delete: wrap(async (req, res) => {
    await branchService.delete(req.params.id);
    apiResponse(res, 200, true, "Branch deleted");
  }),
  toggleStatus: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Status toggled",
      await branchService.toggleStatus(req.params.id),
    ),
  ),
};

// ---- CATEGORY ----
exports.category = {
  create: wrap(async (req, res) =>
    apiResponse(
      res,
      201,
      true,
      "Category created",
      await categoryService.create(req.body),
    ),
  ),
  getAll: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Categories",
      await categoryService.getAll(req.query),
    ),
  ),
  getById: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Category",
      await categoryService.getById(req.params.id),
    ),
  ),
  update: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Category updated",
      await categoryService.update(req.params.id, req.body),
    ),
  ),
  delete: wrap(async (req, res) => {
    await categoryService.delete(req.params.id);
    apiResponse(res, 200, true, "Category deleted");
  }),
  toggleStatus: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Status toggled",
      await categoryService.toggleStatus(req.params.id),
    ),
  ),
};

// ---- ITEM ----
exports.item = {
  create: wrap(async (req, res) => {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    apiResponse(res, 201, true, "Item created", await itemService.create(data));
  }),
  getAll: wrap(async (req, res) =>
    apiResponse(res, 200, true, "Items", await itemService.getAll(req.query)),
  ),
  getById: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Item",
      await itemService.getById(req.params.id),
    ),
  ),
  update: wrap(async (req, res) => {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    apiResponse(
      res,
      200,
      true,
      "Item updated",
      await itemService.update(req.params.id, data),
    );
  }),
  delete: wrap(async (req, res) => {
    await itemService.delete(req.params.id);
    apiResponse(res, 200, true, "Item deleted");
  }),
  toggleStatus: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Status toggled",
      await itemService.toggleStatus(req.params.id),
    ),
  ),
};

// ---- INVENTORY ----
exports.inventory = {
  getAll: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Inventory",
      await inventoryService.getAll(req.query),
    ),
  ),
  adjust: wrap(async (req, res) => {
    const { itemId, action, qty, note } = req.body;
    apiResponse(
      res,
      200,
      true,
      "Inventory adjusted",
      await inventoryService.adjust(itemId, action, +qty, note, req.user._id),
    );
  }),
  getByItem: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Inventory",
      await inventoryService.getByItem(req.params.itemId),
    ),
  ),
};

// ---- CART ----
exports.cart = {
  get: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Cart",
      await cartService.getCart(req.user._id),
    ),
  ),
  addItem: wrap(async (req, res) => {
    const { itemId, quantity } = req.body;
    apiResponse(
      res,
      200,
      true,
      "Added to cart",
      await cartService.addItem(req.user._id, itemId, +quantity || 1),
    );
  }),
  updateItem: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Cart updated",
      await cartService.updateItem(
        req.user._id,
        req.params.cartItemId,
        +req.body.quantity,
      ),
    ),
  ),
  removeItem: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Removed",
      await cartService.removeItem(req.user._id, req.params.cartItemId),
    ),
  ),
  applyCoupon: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Coupon applied",
      await cartService.applyCoupon(req.user._id, req.body.code),
    ),
  ),
  removeCoupon: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Coupon removed",
      await cartService.removeCoupon(req.user._id),
    ),
  ),
  toggleWallet: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Wallet toggled",
      await cartService.toggleWallet(req.user._id, req.body.use),
    ),
  ),
  clear: wrap(async (req, res) => {
    await cartService.clearCart(req.user._id);
    apiResponse(res, 200, true, "Cart cleared");
  }),
};

// ---- ORDER ----
exports.order = {
  create: wrap(async (req, res) =>
    apiResponse(
      res,
      201,
      true,
      "Order placed",
      await orderService.create(req.user._id, req.body),
    ),
  ),
  getAll: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Orders",
      await orderService.getAll(req.user._id, req.user.role, req.query),
    ),
  ),
  getById: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Order",
      await orderService.getById(req.params.id, req.user._id, req.user.role),
    ),
  ),
  updateStatus: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Status updated",
      await orderService.updateStatus(
        req.params.id,
        req.body.status,
        req.body.note,
        req.user._id,
      ),
    ),
  ),
};

// ---- COUPON ----
exports.coupon = {
  create: wrap(async (req, res) =>
    apiResponse(
      res,
      201,
      true,
      "Coupon created",
      await couponService.create(req.body),
    ),
  ),
  getAll: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Coupons",
      await couponService.getAll(req.query),
    ),
  ),
  getById: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Coupon",
      await couponService.getById(req.params.id),
    ),
  ),
  update: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Coupon updated",
      await couponService.update(req.params.id, req.body),
    ),
  ),
  delete: wrap(async (req, res) => {
    await couponService.delete(req.params.id);
    apiResponse(res, 200, true, "Coupon deleted");
  }),
  toggleStatus: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Status toggled",
      await couponService.toggleStatus(req.params.id),
    ),
  ),
};

// ---- WALLET ----
exports.wallet = {
  getMyWallet: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Wallet",
      await walletService.getWallet(req.user._id),
    ),
  ),
  getHistory: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "History",
      await walletService.getHistory(req.user._id, req.query),
    ),
  ),
  addBalance: wrap(async (req, res) => {
    const { userId, amount, description } = req.body;
    apiResponse(
      res,
      200,
      true,
      "Balance added",
      await walletService.addBalance(
        userId,
        +amount,
        description,
        req.user._id,
      ),
    );
  }),
  getAllWallets: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Wallets",
      await walletService.getAllWallets(req.query),
    ),
  ),
};

// ---- NOTIFICATION ----
exports.notification = {
  getAll: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Notifications",
      await notificationService.getAll(req.user._id, req.query),
    ),
  ),
  getUnread: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Count",
      await notificationService.getUnreadCount(req.user._id),
    ),
  ),
  markRead: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Marked read",
      await notificationService.markRead(req.params.id, req.user._id),
    ),
  ),
  markAllRead: wrap(async (req, res) => {
    await notificationService.markAllRead(req.user._id);
    apiResponse(res, 200, true, "All marked read");
  }),
  broadcast: wrap(async (req, res) => {
    const { title, message, type } = req.body;
    apiResponse(
      res,
      201,
      true,
      "Broadcast sent",
      await notificationService.broadcast(title, message, type),
    );
  }),
  getAllAdmin: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "All notifications",
      await notificationService.getAll_Admin(req.query),
    ),
  ),
};

// ---- ANALYTICS ----
exports.analytics = {
  getDashboard: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Analytics",
      await analyticsService.getDashboard(),
    ),
  ),
  getCustomerSummary: wrap(async (req, res) =>
    apiResponse(
      res,
      200,
      true,
      "Summary",
      await analyticsService.getCustomerSummary(req.user._id),
    ),
  ),
};

// ---- USER (Admin) ----
exports.user = {
  getAll: wrap(async (req, res) => {
    const User = require("../models/user.model");
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    if (role) filter.role = role;
    const [users, total] = await Promise.all([
      User.find(filter)
        .skip((page - 1) * limit)
        .limit(+limit)
        .sort("-createdAt"),
      User.countDocuments(filter),
    ]);
    const { paginate } = require("../utils/apiResponse");
    apiResponse(res, 200, true, "Users", {
      users,
      ...paginate(page, limit, total),
    });
  }),
  getById: wrap(async (req, res) => {
    const User = require("../models/user.model");
    const user = await User.findById(req.params.id);
    if (!user) {
      const { apiResponse } = require("../utils/apiResponse");
      return apiResponse(res, 404, false, "User not found");
    }
    apiResponse(res, 200, true, "User", user);
  }),
  toggleStatus: wrap(async (req, res) => {
    const User = require("../models/user.model");
    const user = await User.findById(req.params.id);
    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }
    user.isActive = !user.isActive;
    await user.save();
    apiResponse(res, 200, true, "Status toggled", user);
  }),
};

// ---- MEDIA ----
exports.media = {
  upload: wrap(async (req, res) => {
    if (!req.file)
      throw Object.assign(new Error("No file uploaded"), { statusCode: 400 });
    apiResponse(res, 200, true, "Uploaded", {
      url: req.file.path,
      filename: req.file.filename,
    });
  }),
};
