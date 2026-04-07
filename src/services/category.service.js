const Category = require('../models/category.model');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class CategoryService {
  async create(data) { return Category.create(data); }

  async getAll({ shopId, search, page = 1, limit = 50 } = {}) {
    const filter = {};
    if (shopId) filter.shop = shopId;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const [categories, total] = await Promise.all([
      Category.find(filter).populate('shop', 'name').skip((page - 1) * limit).limit(+limit).sort('sortOrder'),
      Category.countDocuments(filter),
    ]);
    return { categories, ...paginate(page, limit, total) };
  }

  async getById(id) {
    const c = await Category.findById(id);
    if (!c) throw err('Category not found', 404);
    return c;
  }

  async update(id, data) {
    const c = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!c) throw err('Category not found', 404);
    return c;
  }

  async delete(id) {
    if (!await Category.findByIdAndDelete(id)) throw err('Category not found', 404);
  }

  async toggleStatus(id) {
    const c = await Category.findById(id);
    if (!c) throw err('Category not found', 404);
    c.isActive = !c.isActive;
    return c.save();
  }
}

module.exports = new CategoryService();
