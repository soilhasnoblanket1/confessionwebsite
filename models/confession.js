const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  confession: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
  },
  redeemerId: {
    type: String,
    default: null,
  },
  redeemed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Confession', confessionSchema);