const Item = require('../models/item.model');
const Inventory = require('../models/inventory.model');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class ItemService {
  async create(data) {
    const item = await Item.create(data);
    await Inventory.create({ item: item._id, shop: item.shop, branch: item.branch, stock: 0 });
    return item;
  }

  async getAll({ shopId, categoryId, branchId, search, page = 1, limit = 20 } = {}) {
    const filter = { isActive: true };
    if (shopId) filter.shop = shopId;
    if (categoryId) filter.category = categoryId;
    if (branchId) filter.branch = branchId;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('category', 'name')
        .populate('branch', 'name')
        .populate('shop', 'name')
        .skip((page - 1) * limit).limit(+limit).sort('-createdAt'),
      Item.countDocuments(filter),
    ]);
    // attach stock
    const ids = items.map(i => i._id);
    const inventories = await Inventory.find({ item: { $in: ids } });
    const stockMap = {};
    inventories.forEach(inv => { stockMap[inv.item.toString()] = inv.stock; });
    const result = items.map(i => ({ ...i.toObject(), stock: stockMap[i._id.toString()] ?? 0 }));
    return { items: result, ...paginate(page, limit, total) };
  }

  async getById(id) {
    const item = await Item.findById(id).populate('category', 'name').populate('branch', 'name').populate('shop', 'name');
    if (!item) throw err('Item not found', 404);
    const inv = await Inventory.findOne({ item: id });
    return { ...item.toObject(), stock: inv?.stock ?? 0 };
  }

  async update(id, data) {
    const item = await Item.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) throw err('Item not found', 404);
    return item;
  }

  async delete(id) {
    if (!await Item.findByIdAndDelete(id)) throw err('Item not found', 404);
    await Inventory.findOneAndDelete({ item: id });
  }

  async toggleStatus(id) {
    const item = await Item.findById(id);
    if (!item) throw err('Item not found', 404);
    item.isActive = !item.isActive;
    return item.save();
  }
}

module.exports = new ItemService();
