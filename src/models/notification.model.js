const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'wallet', 'offer', 'general', 'system'], default: 'general' },
  read: { type: Boolean, default: false },
  isBroadcast: { type: Boolean, default: false },
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
