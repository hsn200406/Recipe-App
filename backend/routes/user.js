const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Notification = require("../models/Notification");
const {
  buildProfileUpdates,
  normalizeProfileInput,
  validateProfileInput,
} = require("../utils/profileValidation");

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
    const profileInput = normalizeProfileInput(req.body);
    const validationMessage = validateProfileInput(profileInput);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const { handle } = profileInput;

    if (handle) {
      const existing = await User.findOne({
        handle: handle.toLowerCase(),
        _id: { $ne: req.userId },
      });

      if (existing) {
        return res.status(400).json({ message: "Handle already exists" });
      }
    }

    const updates = buildProfileUpdates(profileInput);

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

router.delete("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Recipe.deleteMany({ creatorId: req.userId });

    await User.updateMany(
      { following: req.userId },
      { $pull: { following: req.userId } },
    );

    await User.updateMany(
      { followers: req.userId },
      { $pull: { followers: req.userId } },
    );

    await User.findByIdAndDelete(req.userId);

    res.json({ message: "Account deleted" });
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

      await Notification.create({
        recipientId: creatorId,
        actorId: req.userId,
        type: "follow",
      });
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

router.get("/:userId/followers", async (req, res) => {
  try {
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await User.find({ _id: { $in: user.followers } }).select(
      "name handle avatarColor specialty bio",
    );

    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:userId/following", async (req, res) => {
  try {
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = await User.find({ _id: { $in: user.following } }).select(
      "name handle avatarColor specialty bio",
    );

    res.json(following);
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

module.exports = router;
