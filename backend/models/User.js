const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 50,
    },

    handle: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
      match: /^[a-z0-9_]+$/, // only allow letters, numbers, underscores
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/, // basic email format validation
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
    },

    bio: {
      type: String,
      default: "",
      maxLength: 160,
    },

    avatarColor: {
      type: String,
      default: "#FF5C3A",
    },

    specialty: {
      type: String,
      default: "",
      maxLength: 40,
    },

    likedRecipes: {
      type: [String],
      default: [],
    },

    savedRecipes: {
      type: [String],
      default: [],
    },

    following: {
      type: [String],
      default: [],
    },

    followers: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
