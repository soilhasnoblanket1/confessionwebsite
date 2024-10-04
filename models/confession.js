const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  confession: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
    required: true,
  },
  redeemed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Confession', confessionSchema);
