const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  likedRecipes: {
    type: [String],
    default: []
  },
  savedRecipes: {
    type: [String],
    default: []
  },
  following: {
    type: [String],
    default: [] // Array of followed creator IDs
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);