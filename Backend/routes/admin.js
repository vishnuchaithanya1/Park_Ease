const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

router.get("/dashboard", auth, admin, (req, res) => {
  res.json({ message: "Welcome Admin! You have full access." });
});

// See all users (Admin only)
const User = require("../models/user");
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get detailed user information (Admin only)
const Booking = require("../models/bookingModel");
router.get("/users/:userId/details", auth, admin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user information
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's booking history
    const bookings = await Booking.find({ user: userId })
      .populate("slot", "slotNumber section address city area")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === "BOOKED").length;
    const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;

    // Calculate total amount spent
    const totalSpent = bookings.reduce((sum, booking) => {
      return sum + (booking.payment?.amount || 0);
    }, 0);

    // Get account creation date
    const accountCreatedAt = user._id.getTimestamp();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicleNumber: user.vehicleNumber,
        vehicleType: user.vehicleType,
        phone: user.phone,
        role: user.role,
        createdAt: accountCreatedAt,
        expiresAt: user.expiresAt
      },
      statistics: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent: totalSpent.toFixed(2)
      },
      bookings: bookings.map(booking => ({
        id: booking._id,
        slotNumber: booking.slot?.slotNumber || 'N/A',
        slotSection: booking.slot?.section || 'General',
        location: booking.slot?.address || 'N/A',
        city: booking.slot?.city || 'N/A',
        vehicleNumber: booking.vehicleNumber,
        startTime: booking.startTime,
        endTime: booking.endTime,
        actualEntryTime: booking.actualEntryTime,
        actualExitTime: booking.actualExitTime,
        actualDuration: booking.actualDuration,
        parkingStatus: booking.parkingStatus,
        status: booking.status,
        paymentAmount: booking.payment?.amount || 0,
        paymentStatus: booking.payment?.status || 'pending',
        paymentMethod: booking.payment?.method,
        createdAt: booking.createdAt
      }))
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ error: err.message });
  }
});

const Slot = require("../models/slotModel");
const { generateSlotName } = require("../utils/slotNaming");

// Create Slot Route
router.post("/create-slot", auth, admin, async (req, res) => {
  const { slotNumber, isBooked, section, city, area, address, placeType, latitude, longitude } = req.body;
  try {
    let isAvailable = true;
    if (req.body.isAvailable !== undefined) {
      isAvailable = req.body.isAvailable;
    } else if (isBooked !== undefined) {
      isAvailable = !isBooked;
    }

    // Generate slot name using new naming convention
    // If slotNumber is provided, use it as the slot ID part
    // Otherwise, auto-generate a slot ID
    const slotId = slotNumber || `A${Date.now().toString().slice(-3)}`;
    const generatedSlotName = generateSlotName(
      city || 'Hyderabad',
      address || 'Smart Parking Complex',
      slotId,
      placeType
    );

    // Check if slot already exists
    const existingSlot = await Slot.findOne({ slotNumber: generatedSlotName });
    if (existingSlot) {
      return res.status(400).json({ message: `Slot ${generatedSlotName} already exists` });
    }

    const newSlot = new Slot({
      slotNumber: generatedSlotName,
      isAvailable,
      section: section || 'General',
      city: city || 'Hyderabad',
      area: area || 'Madhapur',
      address: address || 'Smart Parking Complex',
      placeType: placeType || 'Shopping Mall',
      latitude,
      longitude
    });

    await newSlot.save();
    res.status(201).json({
      message: "Slot created successfully",
      slot: newSlot,
      info: `Generated slot name: ${generatedSlotName}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Slot (Admin only)
router.put("/slot/:id", auth, admin, async (req, res) => {
  try {
    const { slotNumber, section, isAvailable } = req.body;
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slotNumber) slot.slotNumber = slotNumber;
    if (section) slot.section = section;
    if (isAvailable !== undefined) slot.isAvailable = isAvailable;

    await slot.save();
    res.json({ message: "Slot updated successfully", slot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Slot (Admin only)
router.delete("/slot/:id", auth, admin, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;