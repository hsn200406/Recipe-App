const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/me", auth, async (req, res) => {
  try {
    const { name, handle, bio, avatarColor, specialty } = req.body;

    if (handle) {
      const existing = await User.findOne({
        handle: handle.toLowerCase(),
        _id: { $ne: req.userId },
      });

      if (existing) {
        return res.status(400).json({ message: "Handle already exists" });
      }
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (handle !== undefined) updates.handle = handle.toLowerCase();
    if (bio !== undefined) updates.bio = bio;
    if (avatarColor !== undefined) updates.avatarColor = avatarColor;
    if (specialty !== undefined) updates.specialty = specialty;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No profile fields provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LIKE recipe
router.post("/like/:id", auth, async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: "Current user not found" });
  }

  const recipeId = req.params.id;

  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  const alreadyLiked = user.likedRecipes.includes(recipeId);

  if (alreadyLiked) {
    user.likedRecipes = user.likedRecipes.filter((id) => id !== recipeId);
    recipe.likes = Math.max(0, recipe.likes - 1);
  } else {
    user.likedRecipes.push(recipeId);
    recipe.likes += 1;
  }

  await user.save();
  res.json(user.likedRecipes);
});

// ─────────────────────────────
// 🔖 SAVE / UNSAVE RECIPE
// ─────────────────────────────
router.post("/save/:recipeId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Current user not found" });
    }

    const recipeId = req.params.recipeId;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const isSaved = user.savedRecipes.includes(recipeId);

    if (isSaved) {
      user.savedRecipes = user.savedRecipes.filter((id) => id !== recipeId);
      recipe.saves = Math.max(0, recipe.saves - 1);
    } else {
      user.savedRecipes.push(recipeId);
      recipe.saves += 1;
    }

    await user.save();
    await recipe.save();

    res.json(user.savedRecipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:handle", async (req, res) => {
  try {
    const user = await User.findOne({
      handle: req.params.handle.toLowerCase(),
    }).select("-password -email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FOLLOW / UNFOLLOW USER
router.post("/follow/:creatorId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const creatorId = req.params.creatorId;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (creatorId === req.userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    const alreadyFollowing = user.following.includes(creatorId);

    if (alreadyFollowing) {
      user.following = user.following.filter((id) => id !== creatorId);
      creator.followers = creator.followers.filter((id) => id !== req.userId);
    } else {
      user.following.push(creatorId);
      creator.followers.push(req.userId);
    }

    await user.save();
    await creator.save();

    res.json({
      following: user.following,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
