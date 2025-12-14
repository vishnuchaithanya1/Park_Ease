const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

const User = require("../models/User");


router.get("/dashboard", auth, admin, (req, res) => {
  res.json({ message: "Welcome Admin! You have full access." });
});

router.get("/get-users", auth, admin, async (req, res) => {
  try {
    const users = await User.find(); // fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
