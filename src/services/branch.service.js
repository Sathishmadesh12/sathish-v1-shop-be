const Branch = require('../models/branch.model');
const { paginate } = require('../utils/apiResponse');
const err = (msg, code = 400) => Object.assign(new Error(msg), { statusCode: code });

class BranchService {
  async create(data) { return Branch.create(data); }

  async getAll({ shopId, search, page = 1, limit = 10 } = {}) {
    const filter = {};
    if (shopId) filter.shop = shopId;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const [branches, total] = await Promise.all([
      Branch.find(filter).populate('shop', 'name').skip((page - 1) * limit).limit(+limit).sort('-createdAt'),
      Branch.countDocuments(filter),
    ]);
    return { branches, ...paginate(page, limit, total) };
  }

  async getById(id) {
    const b = await Branch.findById(id).populate('shop', 'name');
    if (!b) throw err('Branch not found', 404);
    return b;
  }

  async update(id, data) {
    const b = await Branch.findByIdAndUpdate(id, data, { new: true });
    if (!b) throw err('Branch not found', 404);
    return b;
  }

  async delete(id) {
    if (!await Branch.findByIdAndDelete(id)) throw err('Branch not found', 404);
  }

  async toggleStatus(id) {
    const b = await Branch.findById(id);
    if (!b) throw err('Branch not found', 404);
    b.isActive = !b.isActive;
    return b.save();
  }
}

module.exports = new BranchService();
