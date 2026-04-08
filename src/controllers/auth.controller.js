const authService = require("../services/auth.service");
const { apiResponse } = require("../utils/apiResponse");

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  register: wrap(async (req, res) => {
    const r = await authService.register(req.body);
    apiResponse(res, 201, true, "Registered", r);
  }),
  login: wrap(async (req, res) => {
    const r = await authService.login(req.body.email, req.body.password);
    apiResponse(res, 200, true, "Login successful", r);
  }),
  logout: wrap(async (req, res) => {
    await authService.logout(req.user._id);
    apiResponse(res, 200, true, "Logged out");
  }),
  refresh: wrap(async (req, res) => {
    const r = await authService.refresh(req.body.refreshToken);
    apiResponse(res, 200, true, "Token refreshed", r);
  }),
  forgotPassword: wrap(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    apiResponse(res, 200, true, "Reset link sent if email exists");
  }),
  resetPassword: wrap(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    apiResponse(res, 200, true, "Password reset");
  }),
  changePassword: wrap(async (req, res) => {
    await authService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    apiResponse(res, 200, true, "Password changed");
  }),
  getMe: (req, res) => apiResponse(res, 200, true, "Profile", req.user),
  updateProfile: wrap(async (req, res) => {
    const { name, phone, address } = req.body;
    const u = await authService.updateProfile(req.user._id, {
      name,
      phone,
      address,
    });
    apiResponse(res, 200, true, "Updated", u);
  }),
};
