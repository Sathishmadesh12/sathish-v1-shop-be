const Shop = require('../models/shop.model');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class ShopService {
  async create(data) { return Shop.create(data); }

  async getAll({ search, page = 1, limit = 10 } = {}) {
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    const [shops, total] = await Promise.all([
      Shop.find(filter).skip((page - 1) * limit).limit(+limit).sort('-createdAt'),
      Shop.countDocuments(filter),
    ]);
    return { shops, ...paginate(page, limit, total) };
  }

  async getById(id) {
    const shop = await Shop.findById(id);
    if (!shop) throw err('Shop not found', 404);
    return shop;
  }

  async update(id, data) {
    const shop = await Shop.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!shop) throw err('Shop not found', 404);
    return shop;
  }

  async delete(id) {
    const shop = await Shop.findByIdAndDelete(id);
    if (!shop) throw err('Shop not found', 404);
  }

  async toggleStatus(id) {
    const shop = await Shop.findById(id);
    if (!shop) throw err('Shop not found', 404);
    shop.isActive = !shop.isActive;
    await shop.save();
    return shop;
  }
}

module.exports = new ShopService();
