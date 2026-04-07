const crypto = require("crypto");
const User = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../config/jwt");
const { sendEmail } = require("../config/email");
const {
  welcomeEmail,
  forgotPasswordEmail,
  passwordChangedEmail,
} = require("../utils/emailTemplates");

const err = (msg, code = 400) =>
  Object.assign(new Error(msg), { statusCode: code });

class AuthService {
  async register(data) {
    if (await User.findOne({ email: data.email }))
      throw err("Email already registered", 409);
    const user = await User.create(data);
    await Wallet.create({ user: user._id });
    sendEmail({
      to: user.email,
      subject: "Welcome to ShopFlow!",
      html: welcomeEmail(user.name),
    }).catch(() => {});
    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    await User.findByIdAndUpdate(user._id, { refreshToken });
    return { token, refreshToken, user };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) throw err("Invalid credentials", 401);
    if (!(await user.comparePassword(password)))
      throw err("Invalid credentials", 401);
    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    await User.findByIdAndUpdate(user._id, { refreshToken });
    return { token, refreshToken, user: user.toJSON() };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async refresh(token) {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token)
      throw err("Invalid refresh token", 401);
    const newToken = generateToken({ id: user._id, role: user.role });
    const newRefresh = generateRefreshToken({ id: user._id });
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefresh });
    return { token: newToken, refreshToken: newRefresh };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return;
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL_LOCAL || "http://localhost:3001"}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      html: forgotPasswordEmail(user.name, resetUrl),
    });
  }

  async resetPassword(token, newPassword) {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw err("Invalid or expired token", 400);
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  async changePassword(userId, currentPwd, newPwd) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw err("User not found", 404);
    if (!(await user.comparePassword(currentPwd)))
      throw err("Current password incorrect", 400);
    user.password = newPwd;
    await user.save();
    sendEmail({
      to: user.email,
      subject: "Password Changed",
      html: passwordChangedEmail(user.name),
    }).catch(() => {});
  }

  async updateProfile(userId, data) {
    return User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true },
    );
  }
}

module.exports = new AuthService();
