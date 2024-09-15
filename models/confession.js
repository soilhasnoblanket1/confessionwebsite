const mongoose = require("mongoose");

const Confession = mongoose.model("Confession", {
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
});

module.exports = Confession;
