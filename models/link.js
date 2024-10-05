const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  linkCode: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

const Link = mongoose.model('Linkdata', linkSchema);

module.exports = Link;