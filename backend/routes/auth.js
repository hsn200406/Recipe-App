const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dns = require("dns").promises;
const {
  normalizeLoginInput,
  normalizeRegisterInput,
  validateRegisterInput,
} = require("../utils/authValidation");

async function hasValidEmailDomain(email) {
  const domain = email.split("@")[1];

  if (!domain) return false;

  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, handle, email, password } = normalizeRegisterInput(req.body);
    const validationMessage = validateRegisterInput({
      name,
      handle,
      email,
      password,
    });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const emailDomainValid = await hasValidEmailDomain(email);

    if (!emailDomainValid) {
      return res.status(400).json({
        message: "Please use an email address with a valid email domain",
      });
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
    const { email, password } = normalizeLoginInput(req.body);

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
