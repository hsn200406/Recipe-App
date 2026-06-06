const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Routes:
// GET    /api/recipes              Public recipe feed
// POST   /api/recipes              Create recipe
// GET    /api/recipes/me           My recipes
// GET    /api/recipes/user/:userId Public recipes by user
// GET    /api/recipes/saved        My saved public recipes
// GET    /api/recipes/following    Public recipes from followed users
// GET    /api/recipes/search       Search public recipes
// POST   /api/recipes/:id/like     Like/unlike recipe
// POST   /api/recipes/:id/save     Save/unsave recipe
// POST   /api/recipes/:id/reviews  Add review
// POST   /api/recipes/:id/share    Count share
// PUT    /api/recipes/:id          Update my recipe
// DELETE /api/recipes/:id          Delete my recipe
// GET    /api/recipes/:id          Get public recipe by id

router.get('/', async (req, res) => {
  const recipes = await Recipe.find({ isPublic: true })
    .populate('creatorId', 'name handle avatarColor specialty')
    .sort({ createdAt: -1 });
  res.json(recipes);
});

router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      cuisine,
      meal,
      time,
      calories,
      protein,
      carbs,
      fat,
      ingredients,
      steps,
      tags,
      isPublic,
      emoji,
      cardColor,
      accentColor
      } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Recipe Title is required' });
    }

    if (ingredients !== undefined && !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients must be an array' });
    }

    if (steps !== undefined && !Array.isArray(steps)) {
      return res.status(400).json({ message: 'Steps must be an array' });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    const recipe = await Recipe.create({
      title,
      description,
      imageUrl: imageUrl ?? '',
      videoUrl: videoUrl ?? '',
      hasVideo: Boolean(videoUrl),
      cuisine: cuisine ?? '',
      meal: meal ?? '',
      time: time ?? '',
      calories: calories ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      ingredients: ingredients ?? [],
      steps: steps ?? [],
      tags: tags ?? [],
      isPublic: isPublic ?? true,
      emoji: emoji ?? '🍽️',
      cardColor: cardColor ?? '#1A1410',
      accentColor: accentColor ?? '#FF5C3A',
      creatorId: req.userId,
    });

    res.status(201).json(recipe);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ creatorId: req.userId })
      .populate('creatorId', 'name handle avatarColor specialty')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const recipes = await Recipe.find({
      creatorId: req.params.userId,
      isPublic: true
    })
    .populate('creatorId', 'name handle avatarColor specialty')
    .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.creatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own recipes' });
    }

    await recipe.deleteOne();

    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.creatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only edit your own recipes' });
    }

    if (req.body.ingredients !== undefined && !Array.isArray(req.body.ingredients)) {
      return res.status(400).json({ message: 'Ingredients must be an array' });
    }

    if (req.body.steps !== undefined && !Array.isArray(req.body.steps)) {
      return res.status(400).json({ message: 'Steps must be an array' });
    }

    if (req.body.tags !== undefined && !Array.isArray(req.body.tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    const {
      title,
      description,
      imageUrl,
      videoUrl,
      cuisine,
      meal,
      time,
      calories,
      protein,
      carbs,
      fat,
      ingredients,
      steps,
      tags,
      isPublic,
      emoji,
      cardColor,
      accentColor
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (videoUrl !== undefined) {
      updates.videoUrl = videoUrl;
      updates.hasVideo = Boolean(videoUrl);
    }
    if (cuisine !== undefined) updates.cuisine = cuisine;
    if (meal !== undefined) updates.meal = meal;
    if (time !== undefined) updates.time = time;
    if (calories !== undefined) updates.calories = calories;
    if (protein !== undefined) updates.protein = protein;
    if (carbs !== undefined) updates.carbs = carbs;
    if (fat !== undefined) updates.fat = fat;
    if (ingredients !== undefined) updates.ingredients = ingredients;
    if (steps !== undefined) updates.steps = steps;
    if (tags !== undefined) updates.tags = tags;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (emoji !== undefined) updates.emoji = emoji;
    if (cardColor !== undefined) updates.cardColor = cardColor;
    if (accentColor !== undefined) updates.accentColor = accentColor;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No recipe fields provided' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('creatorId', 'name handle avatarColor specialty');

    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(req.params.id);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipeId = req.params.id;
    const alreadyLiked = user.likedRecipes.includes(recipeId);

    if (alreadyLiked) {
      user.likedRecipes = user.likedRecipes.filter(id => id !== recipeId);
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      user.likedRecipes.push(recipeId);
      recipe.likes += 1;
    }

    await user.save();
    await recipe.save();

    res.json({
      likedRecipes: user.likedRecipes,
      likes: recipe.likes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/save', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(req.params.id);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipeId = req.params.id;
    const alreadySaved = user.savedRecipes.includes(recipeId);

    if (alreadySaved) {
      user.savedRecipes = user.savedRecipes.filter(id => id !== recipeId);
      recipe.saves = Math.max(0, recipe.saves - 1);
    } else {
      user.savedRecipes.push(recipeId);
      recipe.saves += 1;
    }

    await user.save();
    await recipe.save();

    res.json({
      savedRecipes: user.savedRecipes,
      saves: recipe.saves
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/reviews', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const recipe = await Recipe.findById(req.params.id);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.reviews.push({
      userId: user._id,
      user: user.handle,
      rating,
      text: text ?? ''
    });

    recipe.ratingCount = recipe.reviews.length;
    recipe.commentCount = recipe.reviews.length;

    const totalRating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0);
    recipe.rating = totalRating / recipe.ratingCount;

    await recipe.save();

    res.status(201).json({
      reviews: recipe.reviews,
      rating: recipe.rating,
      ratingCount: recipe.ratingCount,
      commentCount: recipe.commentCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const recipes = await Recipe.find({
      _id: { $in: user.savedRecipes },
      isPublic: true
    })
      .populate('creatorId', 'name handle avatarColor specialty')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const recipes = await Recipe.find({
      creatorId: { $in: user.following },
      isPublic: true
    })
      .populate('creatorId', 'name handle avatarColor specialty')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, cuisine, meal, protein, carbs, fat } = req.query;

    const filter = { isPublic: true };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
        { meal: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }

    if (cuisine && cuisine !== 'All') {
      filter.cuisine = cuisine;
    }

    if (meal && meal !== 'All') {
      filter.meal = meal;
    }

    if (protein === 'High') filter.protein = { $gte: 30 };
    if (protein === 'Low') filter.protein = { $lte: 15 };

    if (carbs === 'High') filter.carbs = { $gte: 60 };
    if (carbs === 'Low') filter.carbs = { $lte: 30 };

    if (fat === 'High') filter.fat = { $gte: 25 };
    if (fat === 'Low') filter.fat = { $lte: 10 };

    const recipes = await Recipe.find(filter)
      .populate('creatorId', 'name handle avatarColor specialty')
      .sort({ rating: -1, likes: -1, createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/test-auth', auth, (req, res) => {
  res.json({
    message: "You are authenticated 🎉",
    userId: req.userId
  });
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.shares += 1;

    await recipe.save();

    res.json({
      shares: recipe.shares
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await Recipe.findById(req.params.id)
      .populate('creatorId', 'name handle avatarColor specialty');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.isPublic) {
      return res.status(403).json({ message: 'This recipe is private' });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;