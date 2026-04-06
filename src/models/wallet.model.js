const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const walletTxnSchema = new mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: String,
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  balanceAfter: Number,
}, { timestamps: true });

module.exports = {
  Wallet: mongoose.model('Wallet', walletSchema),
  WalletTransaction: mongoose.model('WalletTransaction', walletTxnSchema),
};
