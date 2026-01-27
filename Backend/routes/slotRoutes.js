const express = require("express");
const router = express.Router();
const Slot = require("../models/slotModel");
const { emitSlotUpdate } = require("../socketHandlers");

// GET all parking slots
router.get("/all", async (req, res) => {
    try {
        const slots = await Slot.find();
        res.json({ slots });
    } catch (err) {
        res.status(500).json({ message: "Error fetching slots" });
    }
});

// PUT update slot availability (for admin or system use)
router.put("/:slotId/availability", async (req, res) => {
    try {
        const { slotId } = req.params;
        const { isAvailable } = req.body;

        const slot = await Slot.findByIdAndUpdate(
            slotId,
            { isAvailable },
            { new: true }
        );

        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        // Emit real-time update
        emitSlotUpdate(slot);

        res.json({ message: "Slot updated", slot });
    } catch (err) {
        res.status(500).json({ message: "Error updating slot" });
    }
});

module.exports = router;