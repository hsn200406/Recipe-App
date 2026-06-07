const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    qty: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    hasVideo: {
      type: Boolean,
      default: false,
    },

    cuisine: {
      type: String,
      default: "",
    },

    meal: {
      type: String,
      default: "",
    },

    time: {
      type: String,
      default: "",
    },

    calories: {
      type: Number,
      default: 0,
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

    ingredients: {
      type: [ingredientSchema],
      default: [],
    },

    steps: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    emoji: {
      type: String,
      default: "🍽️",
    },

    cardColor: {
      type: String,
      default: "#1A1410",
    },

    accentColor: {
      type: String,
      default: "#FF5C3A",
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
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

    shares: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recipe", recipeSchema);
