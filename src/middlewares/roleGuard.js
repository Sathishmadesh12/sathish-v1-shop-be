const { apiResponse } = require("../utils/apiResponse");
const roleGuard =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return apiResponse(res, 403, false, "Access denied");
    next();
  };
module.exports = roleGuard;
