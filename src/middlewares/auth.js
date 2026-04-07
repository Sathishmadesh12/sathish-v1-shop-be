const { verifyToken } = require('../config/jwt');
const User = require('../models/user.model');
const { apiResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return apiResponse(res, 401, false, 'Not authenticated');
    const token = auth.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return apiResponse(res, 401, false, 'User not found or inactive');
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return apiResponse(res, 401, false, 'Token expired');
    return apiResponse(res, 401, false, 'Invalid token');
  }
};

module.exports = { protect };
