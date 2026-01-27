const express = require("express");
const router = express.Router();
const Alert = require("../models/alertModel");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// ============================================
// ADMIN ROUTES
// ============================================

// Create new alert (Admin only)
router.post("/", auth, admin, async (req, res) => {
    try {
        const { slot, area, city, message, type, severity, expiresAt } = req.body;

        // Validation: must have at least one target (slot, area, or city)
        if (!slot && !area && !city) {
            return res.status(400).json({
                message: "Alert must target a slot, area, or city"
            });
        }

        const alert = new Alert({
            slot: slot || null,
            area: area || null,
            city: city || null,
            message,
            type,
            severity: severity || "info",
            createdBy: req.user.id,
            expiresAt: expiresAt || null
        });

        await alert.save();

        // Populate references for response
        await alert.populate("slot", "slotNumber address city area");
        await alert.populate("createdBy", "name email");

        res.status(201).json({
            message: "Alert created successfully",
            alert
        });
    } catch (error) {
        console.error("Create alert error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all alerts including inactive/expired (Admin only)
router.get("/all", auth, admin, async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate("slot", "slotNumber address city area")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        console.error("Get all alerts error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update alert (Admin only)
router.put("/:id", auth, admin, async (req, res) => {
    try {
        const { message, type, severity, isActive, expiresAt } = req.body;

        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        // Update fields
        if (message !== undefined) alert.message = message;
        if (type !== undefined) alert.type = type;
        if (severity !== undefined) alert.severity = severity;
        if (isActive !== undefined) alert.isActive = isActive;
        if (expiresAt !== undefined) alert.expiresAt = expiresAt;

        await alert.save();
        await alert.populate("slot", "slotNumber address city area");
        await alert.populate("createdBy", "name email");

        res.json({
            message: "Alert updated successfully",
            alert
        });
    } catch (error) {
        console.error("Update alert error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete alert (Admin only)
router.delete("/:id", auth, admin, async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        res.json({ message: "Alert deleted successfully" });
    } catch (error) {
        console.error("Delete alert error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all active, non-expired alerts
router.get("/", async (req, res) => {
    try {
        const now = new Date();

        const alerts = await Alert.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .populate("slot", "slotNumber address city area")
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        console.error("Get active alerts error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get alerts for specific slot
router.get("/slot/:slotId", async (req, res) => {
    try {
        const now = new Date();

        const alerts = await Alert.find({
            slot: req.params.slotId,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .populate("slot", "slotNumber address city area")
            .sort({ severity: -1, createdAt: -1 }); // Critical alerts first

        res.json(alerts);
    } catch (error) {
        console.error("Get slot alerts error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get alerts for specific area
router.get("/area/:area", async (req, res) => {
    try {
        const now = new Date();

        const alerts = await Alert.find({
            area: req.params.area,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .sort({ severity: -1, createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        console.error("Get area alerts error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get alerts for specific city
router.get("/city/:city", async (req, res) => {
    try {
        const now = new Date();

        const alerts = await Alert.find({
            city: req.params.city,
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .sort({ severity: -1, createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        console.error("Get city alerts error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
