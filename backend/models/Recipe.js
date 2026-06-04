const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: '',
  },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  imageUrl: {
    type: String,
    default: '',
  },

  videoUrl: {
    type: String,
    default: '',
  },

  hasVideo: {
    type: Boolean,
    default: false,
  },

  cuisine: {
    type: String,
    default: '',
  },

  meal: {
    type: String,
    default: '',
  },

  protein: {
    type: Number,
    default: 0,
  },

  carbs: {
    type: Number,
    default: 0,
  },

  fat: {
    type: Number,
    default: 0,
  },

  tags: {
    type: [String],
    default: [],
  },

  rating: {
    type: Number,
    default: 0,
  },

  ratingCount: {
    type: Number,
    default: 0,
  },

  likes: {
    type: Number,
    default: 0,
  },

  saves: {
    type: Number,
    default: 0,
  },

  commentCount: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);