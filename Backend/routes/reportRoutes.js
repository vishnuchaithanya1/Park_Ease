const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { Parser } = require("json2csv");
const {
    generateUsageReport,
    getPersonalStats,
    generateCSVData
} = require("../services/reportService");

/**
 * GET /api/reports/usage
 * Get comprehensive usage report (Admin only)
 * Query params: startDate, endDate, slotId, userType, city, area, address
 */
router.get("/usage", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            slotId,
            userType,
            city,
            area,
            address
        } = req.query;

        // Default to last 30 days if no dates provided
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Build filters object
        const filters = {};
        if (slotId) filters.slotId = slotId;
        if (userType) filters.userType = userType;
        if (city) filters.city = city;
        if (area) filters.area = area;
        if (address) filters.address = address;

        const report = await generateUsageReport(start, end, filters);

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error("Error fetching usage report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch usage report",
            error: error.message
        });
    }
});

/**
 * GET /api/reports/my-stats
 * Get personal statistics for authenticated user
 */
router.get("/my-stats", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await getPersonalStats(userId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("Error fetching personal stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch personal statistics",
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/csv
 * Export report data as CSV (Admin only)
 * Query params: same as /usage endpoint
 */
router.get("/export/csv", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            slotId,
            userType,
            city,
            area,
            address
        } = req.query;

        // Default to last 30 days if no dates provided
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Build query
        const query = {
            createdAt: {
                $gte: start,
                $lte: end
            }
        };

        if (slotId) query.slot = slotId;

        // Fetch bookings
        const bookings = await Booking.find(query)
            .populate("user", "name email role")
            .populate("slot", "slotNumber city area address placeType")
            .sort({ createdAt: -1 });

        // Apply additional filters
        let filteredBookings = bookings;
        if (userType && userType !== 'all') {
            filteredBookings = bookings.filter(b => b.user?.role === userType);
        }
        if (city) {
            filteredBookings = filteredBookings.filter(b => b.slot?.city === city);
        }
        if (area) {
            filteredBookings = filteredBookings.filter(b => b.slot?.area === area);
        }
        if (address) {
            filteredBookings = filteredBookings.filter(b => b.slot?.address === address);
        }

        // Generate CSV data
        const csvData = generateCSVData(null, filteredBookings);

        // Convert to CSV
        const parser = new Parser();
        const csv = parser.parse(csvData);

        // Set headers for file download
        const filename = `parking_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.send(csv);
    } catch (error) {
        console.error("Error exporting CSV:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export CSV",
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export/my-csv
 * Export personal booking data as CSV (Authenticated users)
 */
router.get("/export/my-csv", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user's bookings
        const bookings = await Booking.find({ user: userId })
            .populate("user", "name email role")
            .populate("slot", "slotNumber city area address placeType")
            .sort({ createdAt: -1 });

        // Generate CSV data
        const csvData = generateCSVData(null, bookings);

        // Convert to CSV
        const parser = new Parser();
        const csv = parser.parse(csvData);

        // Set headers for file download
        const filename = `my_parking_history_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.send(csv);
    } catch (error) {
        console.error("Error exporting personal CSV:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export personal CSV",
            error: error.message
        });
    }
});

/**
 * GET /api/reports/peak-hours
 * Get peak hours analysis (Admin only)
 */
router.get("/peak-hours", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const report = await generateUsageReport(start, end, {});

        res.json({
            success: true,
            peakHours: report.peakHours
        });
    } catch (error) {
        console.error("Error fetching peak hours:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch peak hours",
            error: error.message
        });
    }
});

/**
 * GET /api/reports/slot-utilization
 * Get slot utilization data (Admin only)
 */
router.get("/slot-utilization", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const report = await generateUsageReport(start, end, {});

        res.json({
            success: true,
            slotUtilization: report.segmentation.bySlot
        });
    } catch (error) {
        console.error("Error fetching slot utilization:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch slot utilization",
            error: error.message
        });
    }
});

module.exports = router;
