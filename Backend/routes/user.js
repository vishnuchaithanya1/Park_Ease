const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const userMiddleware = require("../middleware/userMiddleware");

// User Dashboard (User only)
router.get("/dashboard", auth, userMiddleware, (req, res) => {
    res.json({ message: "Welcome User! You have access to your dashboard." });
});

module.exports = router;
