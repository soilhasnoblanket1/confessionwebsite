const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, required: true },
  coins: { type: Number, default: 0 },
  lastDaily: { type: Date, default: Date.now },
  hasLeatherHat: { type: Boolean, default: false }
});

const Coin = mongoose.model('Coin', coinSchema);

module.exports = Coin;