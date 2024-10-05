const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  confession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
  linkCodeVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  },
  username: {
    type: String
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;