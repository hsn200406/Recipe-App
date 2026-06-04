const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const User = require('../models/User');

// LIKE recipe
router.post('/like/:id', auth, async (req, res) => {
  const user = await User.findById(req.userId);

  const recipeId = req.params.id;

  const alreadyLiked = user.likedRecipes.includes(recipeId);

  if (alreadyLiked) {
    user.likedRecipes = user.likedRecipes.filter(id => id !== recipeId);
  } else {
    user.likedRecipes.push(recipeId);
  }

  await user.save();
  res.json(user);
});

// ─────────────────────────────
// 🔖 SAVE / UNSAVE RECIPE
// ─────────────────────────────
router.post('/save/:recipeId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const recipeId = req.params.recipeId;
    const isSaved = user.savedRecipes.includes(recipeId);

    if (isSaved) {
      user.savedRecipes = user.savedRecipes.filter(id => id !== recipeId);
    } else {
      user.savedRecipes.push(recipeId);
    }

    await user.save();

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;