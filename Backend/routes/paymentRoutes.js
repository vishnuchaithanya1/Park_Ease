const express = require("express");
const router = express.Router();
const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");

const JAVA_ANALYTICS_URL = process.env.JAVA_ANALYTICS_URL || "http://localhost:8080/api/analytics";

// POST /api/payments/calculate - Calculate payment amount
router.post("/calculate", authMiddleware, async (req, res) => {
    try {
        const { startTime, endTime } = req.body;

        if (!startTime || !endTime) {
            return res.status(400).json({ message: "Start time and end time are required" });
        }

        try {
            // Try calling Java service first
            const paymentResponse = await axios.post(`${JAVA_ANALYTICS_URL}/calculate-payment`, {
                startTime,
                endTime
            }, {
                timeout: 5000
            });

            return res.json(paymentResponse.data);
        } catch (javaError) {
            // If Java service fails, use local calculation as fallback
            console.log("Java service unavailable, using fallback calculation");

            const start = new Date(startTime);
            const end = new Date(endTime);
            const durationMs = end - start;
            const durationMinutes = Math.ceil(durationMs / (1000 * 60));
            const durationHours = durationMinutes / 60;

            // ₹20 per hour, rounded up to nearest 15 minutes
            const roundedMinutes = Math.ceil(durationMinutes / 15) * 15;
            const amount = (roundedMinutes / 60) * 20;

            return res.json({
                durationHours: durationHours,
                amount: amount,
                breakdown: `${durationMinutes} minutes (${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m) × ₹20/hour = ₹${amount}`
            });
        }

    } catch (error) {
        console.error("Payment calculation error:", error.message);
        res.status(500).json({
            message: "Failed to calculate payment",
            error: error.message
        });
    }
});

// POST /api/payments/process - Process payment (mock implementation)
router.post("/process", authMiddleware, async (req, res) => {
    try {
        const { bookingId, amount, method } = req.body;
        const userId = req.user.id;

        if (!bookingId || !amount || !method) {
            return res.status(400).json({ message: "Booking ID, amount, and payment method are required" });
        }

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Generate mock transaction ID
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create payment record
        const payment = new Payment({
            booking: bookingId,
            user: userId,
            amount,
            method,
            status: "completed",
            transactionId,
            metadata: {
                processedAt: new Date(),
                paymentGateway: "mock"
            }
        });

        await payment.save();

        // Update booking with payment info
        booking.payment = {
            amount,
            method,
            status: "completed",
            transactionId,
            paidAt: new Date()
        };
        await booking.save();

        res.json({
            message: "Payment processed successfully",
            transactionId,
            payment: {
                amount,
                method,
                status: "completed"
            }
        });

    } catch (error) {
        console.error("Payment processing error:", error);
        res.status(500).json({
            message: "Failed to process payment",
            error: error.message
        });
    }
});

// GET /api/payments/history - Get user's payment history
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .populate("booking")
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error("Payment history error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
