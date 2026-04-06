const base = (
  title,
  color,
  content,
) => `<!DOCTYPE html><html><body style="margin:0;font-family:'Segoe UI',sans-serif;background:#0f0e1a">
<div style="max-width:580px;margin:40px auto;background:#1a1829;border-radius:16px;overflow:hidden;border:1px solid #2d2b45">
<div style="background:linear-gradient(135deg,${color});padding:36px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">${title}</h1></div>
<div style="padding:36px;color:#c4c1e0">${content}</div>
<div style="padding:20px;text-align:center;color:#4e4a6b;font-size:12px;border-top:1px solid #2d2b45">ShopFlow © 2024 · <a href="#" style="color:#818cf8">Unsubscribe</a></div>
</div></body></html>`;

const welcomeEmail = (name) =>
  base(
    "Welcome to ShopFlow! 🛒",
    "#4f46e5,#6366f1",
    `<p>Hi <strong style="color:#f1f0ff">${name}</strong>,</p>
   <p>Your account is ready. Start shopping and enjoy exclusive offers!</p>
   <div style="text-align:center;margin:28px 0"><a href="${process.env.CLIENT_URL_LOCAL || "#"}" style="background:#4f46e5;color:white;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700">Start Shopping →</a></div>`,
  );

const forgotPasswordEmail = (name, url) =>
  base(
    "Reset Password 🔑",
    "#ef4444,#dc2626",
    `<p>Hi <strong style="color:#f1f0ff">${name}</strong>,</p>
   <p>Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
   <div style="text-align:center;margin:28px 0"><a href="${url}" style="background:#ef4444;color:white;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700">Reset Password</a></div>
   <p style="font-size:12px;color:#4e4a6b">If you didn't request this, ignore this email.</p>`,
  );

const orderConfirmEmail = (name, order) =>
  base(
    "Order Confirmed ✅",
    "#10b981,#059669",
    `<p>Hi <strong style="color:#f1f0ff">${name}</strong>,</p>
   <p>Your order <strong style="color:#10b981">#${String(order._id).slice(-8).toUpperCase()}</strong> is confirmed.</p>
   <div style="background:#221f38;border-radius:10px;padding:16px;margin:20px 0">
   <p style="margin:6px 0">💰 Total: <strong style="color:#f59e0b">₹${order.total?.toFixed(2)}</strong></p>
   <p style="margin:6px 0">💳 Payment: <strong>${order.paymentMethod}</strong></p></div>`,
  );

const passwordChangedEmail = (name) =>
  base(
    "Password Changed 🔒",
    "#4f46e5,#6366f1",
    `<p>Hi <strong style="color:#f1f0ff">${name}</strong>,</p>
   <p>Your password was changed. If this wasn't you, contact support immediately.</p>`,
  );

module.exports = {
  welcomeEmail,
  forgotPasswordEmail,
  orderConfirmEmail,
  passwordChangedEmail,
};
