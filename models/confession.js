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
});

module.exports = Confession;
