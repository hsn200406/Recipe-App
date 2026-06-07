const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const handle = req.body.handle?.trim().toLowerCase();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !handle || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    if (name.length < 5) {
      return res
        .status(400)
        .json({ message: "Name must be at least 5 characters" });
    }

    if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
      return res.status(400).json({
        message:
          "Handle must be 3-20 characters and use only letters, numbers, or underscores",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({
      $or: [{ email }, { handle }],
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or handle already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      handle,
      email,
      password: hashedPassword,
    });

    // Generate JWT for new user
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        bio: user.bio,
        avatarColor: user.avatarColor,
        specialty: user.specialty,
        likedRecipes: user.likedRecipes,
        savedRecipes: user.savedRecipes,
        following: user.following,
        followers: user.followers,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        bio: user.bio,
        avatarColor: user.avatarColor,
        specialty: user.specialty,
        likedRecipes: user.likedRecipes,
        savedRecipes: user.savedRecipes,
        following: user.following,
        followers: user.followers,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
