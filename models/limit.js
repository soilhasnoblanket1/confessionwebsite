const mongoose = require("mongoose");

const RateLimit = mongoose.model("RateLimit", {
    ip: String,
    count: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  });

  module.exports = RateLimit;
