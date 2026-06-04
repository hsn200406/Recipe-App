const express = require("express");
const router = express.Router();

// router.get("/", (req, res) => {
//   res.json([
//     { id: 1, title: "Chicken Pasta" },
//     { id: 2, title: "Avocado Toast" },
//   ]);
// });

const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');

router.get('/', async (req, res) => {
  const recipes = await Recipe.find().sort({ createdAt: -1 });
  res.json(recipes);
});

router.get('/test-auth', auth, (req, res) => {
  res.json({
    message: "You are authenticated 🎉",
    userId: req.userId
  });
});

router.post('/create', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      cuisine,
      meal,
      protein,
      carbs,
      fat,
      tags
    } = req.body;

    const recipe = await Recipe.create({
      title,
      description,
      imageUrl: imageUrl ?? '',
      videoUrl: videoUrl ?? '',
      cuisine: cuisine ?? '',
      meal: meal ?? '',
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0,
      tags: tags ?? [],
      creatorId: req.userId,
    });

    res.status(201).json(recipe);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/feed', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 }) // newest first

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;