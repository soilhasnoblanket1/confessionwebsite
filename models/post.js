const mongoose = require("mongoose");

const highScoreSchema = new mongoose.Schema({
  nickname: String,
  score: Number,
});

module.exports = mongoose.model("HighScore", highScoreSchema);
