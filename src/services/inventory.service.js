const Inventory = require('../models/inventory.model');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class InventoryService {
  async getAll({ shopId, branchId, lowStock, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (shopId) filter.shop = shopId;
    if (branchId) filter.branch = branchId;
    if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    const [inventories, total] = await Promise.all([
      Inventory.find(filter).populate('item', 'name image price').populate('branch', 'name').skip((page - 1) * limit).limit(+limit).sort('-updatedAt'),
      Inventory.countDocuments(filter),
    ]);
    return { inventories, ...paginate(page, limit, total) };
  }

  async adjust(itemId, action, qty, note, userId) {
    const inv = await Inventory.findOne({ item: itemId });
    if (!inv) throw err('Inventory not found', 404);
    if (action === 'add') inv.stock += qty;
    else if (action === 'deduct') {
      if (inv.stock < qty) throw err('Insufficient stock');
      inv.stock -= qty;
    } else if (action === 'adjust') {
      inv.stock = qty;
    }
    inv.history.push({ action, qty, note, by: userId, date: new Date() });
    return inv.save();
  }

  async getByItem(itemId) {
    return Inventory.findOne({ item: itemId }).populate('item', 'name');
  }
}

module.exports = new InventoryService();
