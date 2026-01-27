const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");

const JAVA_ANALYTICS_URL = process.env.JAVA_ANALYTICS_URL || "http://localhost:8080/api/analytics";

// GET /api/analytics/dashboard - Get comprehensive analytics
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        // Fetch all bookings from MongoDB
        const bookings = await Booking.find()
            .populate("slot", "slotNumber")
            .sort({ createdAt: -1 });

        // Transform bookings to format expected by Java service
        const bookingData = bookings.map(booking => ({
            id: booking._id.toString(),
            slotNumber: booking.slot?.slotNumber || "Unknown",
            section: booking.slot?.section || "General",
            vehicleNumber: booking.vehicleNumber,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status
        }));


        // Call Java analytics service
        let analyticsData = {};

        // Calculate REAL revenue from actual payments in database
        const realTotalRevenue = bookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

        try {
            const analyticsResponse = await axios.post(`${JAVA_ANALYTICS_URL}/stats`, {
                bookings: bookingData
            }, {
                timeout: 5000 // Short timeout for Java service
            });
            analyticsData = analyticsResponse.data;

            // OVERRIDE Java service's calculated revenue with REAL revenue from database
            analyticsData.totalRevenue = realTotalRevenue;

        } catch (javaError) {
            console.warn("Java analytics service unavailable, falling back to basic stats:", javaError.message);
            // Basic fallback stats if Java service is down
            analyticsData = {
                totalBookings: bookings.length,
                activeBookings: bookings.filter(b => b.status === 'BOOKED').length,
                completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
                totalRevenue: realTotalRevenue, // Use real revenue
                averageDuration: 0,
                peakHour: 'N/A',
                slotUsage: {}
            };
        }

        // Calculate visual analytics (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const revenueData = last7Days.map(date => {
            const daysBookings = bookings.filter(b => {
                const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
                return bookingDate === date;
            });
            return {
                date,
                revenue: daysBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0),
                bookings: daysBookings.length
            };
        });

        // Add visual analytics to response
        res.json({
            ...analyticsData,
            revenueData
        });

    } catch (error) {
        console.error("Analytics error:", error.message);
        res.status(500).json({
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
});

// GET /api/analytics/activity - Get recent activity
router.get("/activity", authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const recentBookings = await Booking.find()
            .populate("user", "name email")
            .populate("slot", "slotNumber")
            .sort({ createdAt: -1 })
            .limit(10);

        const activity = recentBookings.map(b => ({
            id: b._id,
            type: 'booking',
            message: `User ${b.user?.name || 'Unknown'} booked Slot ${b.slot?.slotNumber || 'Unknown'}`,
            time: b.createdAt,
            status: b.status
        }));

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch activity", error: error.message });
    }
});

module.exports = router;
