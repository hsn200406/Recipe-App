const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.userId })
      .populate("actorId", "name handle avatarColor specialty")
      .populate("recipeId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.userId, read: false },
      { read: true },
    );

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.userId },
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
