const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, title: "Chicken Pasta" },
    { id: 2, title: "Avocado Toast" },
  ]);
});

module.exports = router;