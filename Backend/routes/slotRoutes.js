const express = require("express");
const router = express.Router();
const Slot = require("../models/slotModel");

// GET all parking slots
router.get("/all", async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots" });
  }
});

module.exports = router;
