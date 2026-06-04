const express = require("express");
const router = express.Router();

// router.get("/", (req, res) => {
//   res.json([
//     { id: 1, title: "Chicken Pasta" },
//     { id: 2, title: "Avocado Toast" },
//   ]);
// });

const auth = require('../middleware/auth');

router.get('/test-auth', auth, (req, res) => {
  res.json({
    message: "You are authenticated 🎉",
    userId: req.userId
  });
});

module.exports = router;