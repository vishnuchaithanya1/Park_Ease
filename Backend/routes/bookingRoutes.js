const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Slot = require("../models/slotModel");
const authMiddleware = require("../middleware/authMiddleware");
const { emitBookingNotification, emitSlotUpdate } = require("../socketHandlers");
const axios = require("axios");
const logger = require("../utils/logger");
const { validationSchemas, validate } = require("../middleware/validators");

// Java Validation Service URL
const JAVA_VALIDATOR_URL = process.env.JAVA_VALIDATOR_URL || "http://localhost:8080/api/validate-slot";

// POST /api/bookings/create
router.post("/create", authMiddleware, validationSchemas.createBooking, validate, async (req, res) => {
    try {
        const { slotId, vehicleNumber, startTime, endTime } = req.body;
        const userId = req.user.id;

        // 1. Basic Validation
        if (!slotId || !vehicleNumber || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // 2. Get slot details
        const slot = await Slot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        // 3. Call Java Validation Service (Optional - skip if unavailable)
        try {
            const validationResponse = await axios.post(JAVA_VALIDATOR_URL, {
                slotId: slot._id.toString(),
                slotNumber: slot.slotNumber,
                vehicleNumber,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
            }, {
                timeout: 5000,
            });

            if (!validationResponse.data.valid) {
                return res.status(400).json({
                    message: validationResponse.data.message || "Slot validation failed"
                });
            }
        } catch (validationError) {
            // Java service unavailable - proceed without validation
            console.log("Java validation service unavailable, proceeding without validation");
        }

        // 4. Check for time conflicts on this specific slot
        const conflict = await Booking.findOne({
            slot: slotId,
            status: "BOOKED",
            $or: [
                { startTime: { $lt: end, $gte: start } },
                { endTime: { $gt: start, $lte: end } },
                { startTime: { $lte: start }, endTime: { $gte: end } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: "Slot is already booked for this time period" });
        }

        // 5. Create Booking
        const newBooking = new Booking({
            user: userId,
            slot: slotId,
            vehicleNumber,
            startTime: start,
            endTime: end,
            parkingStatus: "SCHEDULED" // Explicitly start as SCHEDULED
        });

        await newBooking.save();

        // 6. Update slot availability
        slot.isAvailable = false;
        await slot.save();

        // 7. Emit real-time events to all connected clients
        emitBookingNotification({
            bookingId: newBooking._id,
            slotNumber: slot.slotNumber,
            vehicleNumber,
            userName: req.user.name,
            startTime: start,
            endTime: end,
        });

        emitSlotUpdate(slot);

        res.status(201).json({
            message: "Booking successful!",
            booking: newBooking,
            slot: slot
        });

    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bookings/my-bookings
router.get("/my-bookings", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate("slot");

        // Ensure all bookings have a status (for legacy data)
        const sanitizedBookings = bookings.map(booking => {
            const b = booking.toObject();
            if (!b.parkingStatus) {
                b.parkingStatus = "SCHEDULED";
            }
            return b;
        });

        res.json(sanitizedBookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bookings/all - Admin only
router.get("/all", authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const bookings = await Booking.find()
            .populate("user", "name email vehicleNumber")
            .populate("slot", "slotNumber")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PARKING TIMER ENDPOINTS
// ============================================

const parkingTimerService = require("../services/parkingTimerService");
const feeCalculationService = require("../services/feeCalculationService");
const paymentSimulationService = require("../services/paymentSimulationService");

// POST /api/bookings/:id/check-in - Record vehicle entry
router.post("/:id/check-in", authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        // Find booking
        const booking = await Booking.findById(bookingId).populate("slot");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify ownership
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check if already checked in
        if (booking.parkingStatus === "CHECKED_IN" || booking.parkingStatus === "CHECKED_OUT") {
            return res.status(400).json({ message: "Booking already checked in" });
        }

        // Record entry time
        const entryTime = new Date();
        booking.actualEntryTime = entryTime;
        booking.parkingStatus = "CHECKED_IN";
        await booking.save();

        console.log(`✓ Check-in successful for booking ${bookingId}`);

        res.json({
            message: "Check-in successful",
            booking: {
                id: booking._id,
                slotNumber: booking.slot.slotNumber,
                vehicleNumber: booking.vehicleNumber,
                actualEntryTime: entryTime,
                parkingStatus: "CHECKED_IN"
            }
        });

    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/bookings/:id/check-out - Record vehicle exit and calculate fee
router.post("/:id/check-out", authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        // Find booking
        const booking = await Booking.findById(bookingId).populate("slot");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify ownership
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check if checked in
        if (booking.parkingStatus !== "CHECKED_IN") {
            return res.status(400).json({ message: "Booking must be checked in first" });
        }

        // Check if already checked out
        if (booking.parkingStatus === "CHECKED_OUT") {
            return res.status(400).json({ message: "Booking already checked out" });
        }

        // Record exit time
        const exitTime = new Date();
        booking.actualExitTime = exitTime;

        // Calculate duration
        const durationMinutes = parkingTimerService.calculateDuration(
            booking.actualEntryTime,
            exitTime
        );
        booking.actualDuration = durationMinutes;

        // Calculate fee
        const feeDetails = feeCalculationService.calculateFee(durationMinutes);
        booking.payment.amount = feeDetails.fee;
        booking.payment.status = "pending"; // Explicitly set to pending, payment not yet processed

        // Update status
        booking.parkingStatus = "CHECKED_OUT";
        await booking.save();

        // Make slot available again
        const slot = await Slot.findById(booking.slot._id);
        if (slot) {
            slot.isAvailable = true;
            await slot.save();
            emitSlotUpdate(slot);
        }

        console.log(`✓ Check-out successful for booking ${bookingId}`);

        res.json({
            message: "Check-out successful",
            booking: {
                id: booking._id,
                slotNumber: booking.slot.slotNumber,
                vehicleNumber: booking.vehicleNumber,
                actualEntryTime: booking.actualEntryTime,
                actualExitTime: exitTime,
                duration: parkingTimerService.getFormattedDuration(durationMinutes),
                parkingStatus: "CHECKED_OUT"
            },
            feeDetails: {
                actualDuration: feeDetails.actualDuration,
                roundedDuration: feeDetails.roundedDuration,
                fee: feeDetails.fee,
                breakdown: feeCalculationService.getFeeBreakdown(durationMinutes)
            }
        });

    } catch (error) {
        console.error("Check-out error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/bookings/:id/process-payment - Process payment for booking
router.post("/:id/process-payment", authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;
        const { method } = req.body; // payment method: upi, credit_card, etc.

        // Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify ownership
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check if checked out
        if (booking.parkingStatus !== "CHECKED_OUT") {
            return res.status(400).json({ message: "Booking must be checked out first" });
        }

        // Check if already paid
        if (booking.payment.status === "completed") {
            return res.status(400).json({ message: "Payment already completed" });
        }

        const amount = booking.payment.amount;

        // Validate amount
        if (!paymentSimulationService.validateAmount(amount)) {
            return res.status(400).json({ message: "Invalid payment amount" });
        }

        // Process payment (simulation)
        const paymentResult = await paymentSimulationService.processPayment(amount, bookingId);

        // Update booking payment details
        booking.payment.status = paymentResult.status;
        booking.payment.method = method || "upi";
        booking.payment.transactionId = paymentResult.transactionId;
        booking.payment.paidAt = paymentResult.success ? new Date() : null;

        if (paymentResult.success) {
            booking.status = "COMPLETED";
        }

        await booking.save();

        console.log(`${paymentResult.success ? '✓' : '✗'} Payment ${paymentResult.status} for booking ${bookingId}`);

        res.json({
            message: paymentResult.message,
            success: paymentResult.success,
            payment: {
                amount: amount,
                method: booking.payment.method,
                status: paymentResult.status,
                transactionId: paymentResult.transactionId,
                paidAt: booking.payment.paidAt
            }
        });

    } catch (error) {
        console.error("Payment processing error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bookings/:id/fee-details - Get fee breakdown for a booking
router.get("/:id/fee-details", authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        // Find booking
        const booking = await Booking.findById(bookingId).populate("slot");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify ownership (or admin)
        if (booking.user.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        // Allow fee details for COMPLETED bookings or CHECKED_OUT bookings
        if (booking.status !== "COMPLETED" && booking.parkingStatus !== "CHECKED_OUT") {
            return res.status(400).json({
                message: "Fee details available only after check-out",
                currentStatus: booking.parkingStatus,
                bookingStatus: booking.status
            });
        }

        // Check if actualDuration exists
        if (!booking.actualDuration || booking.actualDuration === 0) {
            return res.status(400).json({
                message: "Duration data not available for this booking",
                hint: "This booking may not have check-in/check-out data"
            });
        }

        const durationMinutes = booking.actualDuration;
        const feeDetails = feeCalculationService.calculateFee(durationMinutes);

        res.json({
            booking: {
                id: booking._id,
                slotNumber: booking.slot.slotNumber,
                vehicleNumber: booking.vehicleNumber,
                actualEntryTime: booking.actualEntryTime,
                actualExitTime: booking.actualExitTime,
                parkingStatus: booking.parkingStatus,
                status: booking.status
            },
            duration: {
                minutes: durationMinutes,
                formatted: parkingTimerService.getFormattedDuration(durationMinutes)
            },
            fee: {
                actualDuration: feeDetails.actualDuration,
                roundedDuration: feeDetails.roundedDuration,
                amount: feeDetails.fee,
                breakdown: feeCalculationService.getFeeBreakdown(durationMinutes)
            },
            pricing: feeCalculationService.getPricingInfo(),
            payment: booking.payment
        });

    } catch (error) {
        console.error("Fee details error:", error);
        logger.error("Fee details error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

