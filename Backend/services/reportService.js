const Booking = require("../models/bookingModel");
const Slot = require("../models/slotModel");

/**
 * Generate comprehensive usage report
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @param {Object} filters - Additional filters (slotId, userType, city, area, address)
 * @returns {Object} Report data with metrics and breakdowns
 */
const generateUsageReport = async (startDate, endDate, filters = {}) => {
    try {
        // Build query
        const query = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        // Apply filters
        if (filters.slotId) {
            query.slot = filters.slotId;
        }

        // Fetch bookings with populated data
        const bookings = await Booking.find(query)
            .populate({
                path: "user",
                select: "name email role"
            })
            .populate({
                path: "slot",
                select: "slotNumber city area address placeType"
            })
            .sort({ createdAt: -1 });

        // Filter by user type if specified
        let filteredBookings = bookings;
        if (filters.userType && filters.userType !== 'all') {
            filteredBookings = bookings.filter(b => b.user?.role === filters.userType);
        }

        // Filter by location if specified
        if (filters.city) {
            filteredBookings = filteredBookings.filter(b => b.slot?.city === filters.city);
        }
        if (filters.area) {
            filteredBookings = filteredBookings.filter(b => b.slot?.area === filters.area);
        }
        if (filters.address) {
            filteredBookings = filteredBookings.filter(b => b.slot?.address === filters.address);
        }

        // Calculate metrics
        const totalBookings = filteredBookings.length;
        const activeBookings = filteredBookings.filter(b => b.parkingStatus === 'CHECKED_IN').length;
        const completedBookings = filteredBookings.filter(b => b.status === 'COMPLETED').length;
        const cancelledBookings = filteredBookings.filter(b => b.status === 'CANCELLED').length;

        // Revenue calculations
        const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
        const averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const paidBookings = filteredBookings.filter(b => b.payment?.status === 'completed').length;

        // Duration calculations
        const averageDuration = calculateAverageDuration(filteredBookings);

        // Peak hours analysis
        const peakHours = calculatePeakHours(filteredBookings);

        // Segmentation
        const byUserType = segmentByUserType(filteredBookings);
        const bySlot = segmentBySlot(filteredBookings);
        const byLocation = segmentByLocation(filteredBookings);
        const byStatus = segmentByStatus(filteredBookings);

        // Time series data (for charts)
        const timeSeriesData = generateTimeSeriesData(filteredBookings, startDate, endDate);

        return {
            summary: {
                totalBookings,
                activeBookings,
                completedBookings,
                cancelledBookings,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                averageRevenue: parseFloat(averageRevenue.toFixed(2)),
                paidBookings,
                averageDuration: parseFloat(averageDuration.toFixed(2))
            },
            peakHours,
            segmentation: {
                byUserType,
                bySlot,
                byLocation,
                byStatus
            },
            timeSeries: timeSeriesData,
            dateRange: {
                start: startDate,
                end: endDate
            },
            filters: filters
        };
    } catch (error) {
        console.error("Error generating usage report:", error);
        throw new Error("Failed to generate usage report");
    }
};

/**
 * Calculate peak hours from bookings
 */
const calculatePeakHours = (bookings) => {
    const hourCounts = {};

    bookings.forEach(booking => {
        const hour = new Date(booking.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Convert to array and sort by count
    const hourArray = Object.entries(hourCounts).map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        timeLabel: `${hour}:00 - ${hour}:59`
    })).sort((a, b) => b.count - a.count);

    return {
        peakHour: hourArray[0]?.timeLabel || 'N/A',
        peakHourCount: hourArray[0]?.count || 0,
        distribution: hourArray
    };
};

/**
 * Calculate average parking duration in minutes
 */
const calculateAverageDuration = (bookings) => {
    const completedBookings = bookings.filter(b =>
        b.actualEntryTime && b.actualExitTime
    );

    if (completedBookings.length === 0) {
        // Fallback to scheduled duration
        const scheduledDurations = bookings.map(b => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return (end - start) / (1000 * 60); // Convert to minutes
        });

        return scheduledDurations.length > 0
            ? scheduledDurations.reduce((sum, d) => sum + d, 0) / scheduledDurations.length
            : 0;
    }

    const totalDuration = completedBookings.reduce((sum, b) => {
        return sum + (b.actualDuration || 0);
    }, 0);

    return totalDuration / completedBookings.length;
};

/**
 * Segment bookings by user type
 */
const segmentByUserType = (bookings) => {
    const segments = {
        admin: 0,
        user: 0,
        unknown: 0
    };

    bookings.forEach(booking => {
        const role = booking.user?.role || 'unknown';
        segments[role] = (segments[role] || 0) + 1;
    });

    return segments;
};

/**
 * Segment bookings by slot
 */
const segmentBySlot = (bookings) => {
    const slotMap = {};

    bookings.forEach(booking => {
        const slotNumber = booking.slot?.slotNumber || 'Unknown';
        if (!slotMap[slotNumber]) {
            slotMap[slotNumber] = {
                slotNumber,
                slotId: booking.slot?._id,
                count: 0,
                revenue: 0
            };
        }
        slotMap[slotNumber].count++;
        slotMap[slotNumber].revenue += booking.payment?.amount || 0;
    });

    // Convert to array and sort by count
    return Object.values(slotMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 slots
};

/**
 * Segment bookings by location
 */
const segmentByLocation = (bookings) => {
    const locationMap = {};

    bookings.forEach(booking => {
        const location = booking.slot?.address || 'Unknown';
        const city = booking.slot?.city || 'Unknown';
        const area = booking.slot?.area || 'Unknown';

        const key = `${city} - ${area} - ${location}`;

        if (!locationMap[key]) {
            locationMap[key] = {
                city,
                area,
                address: location,
                count: 0,
                revenue: 0
            };
        }
        locationMap[key].count++;
        locationMap[key].revenue += booking.payment?.amount || 0;
    });

    return Object.values(locationMap).sort((a, b) => b.count - a.count);
};

/**
 * Segment bookings by status
 */
const segmentByStatus = (bookings) => {
    const statusMap = {
        BOOKED: 0,
        COMPLETED: 0,
        CANCELLED: 0
    };

    bookings.forEach(booking => {
        const status = booking.status || 'BOOKED';
        statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return statusMap;
};

/**
 * Generate time series data for charts
 */
const generateTimeSeriesData = (bookings, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const timeSeriesMap = {};

    // Initialize all dates in range
    for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        timeSeriesMap[dateKey] = {
            date: dateKey,
            bookings: 0,
            revenue: 0,
            completed: 0,
            cancelled: 0
        };
    }

    // Populate with booking data
    bookings.forEach(booking => {
        const dateKey = new Date(booking.createdAt).toISOString().split('T')[0];
        if (timeSeriesMap[dateKey]) {
            timeSeriesMap[dateKey].bookings++;
            timeSeriesMap[dateKey].revenue += booking.payment?.amount || 0;
            if (booking.status === 'COMPLETED') timeSeriesMap[dateKey].completed++;
            if (booking.status === 'CANCELLED') timeSeriesMap[dateKey].cancelled++;
        }
    });

    return Object.values(timeSeriesMap).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );
};

/**
 * Generate CSV data from report
 */
const generateCSVData = (reportData, bookings) => {
    // Prepare CSV rows
    const csvRows = bookings.map(booking => ({
        'Booking ID': booking._id,
        'Date': new Date(booking.createdAt).toLocaleDateString(),
        'Time': new Date(booking.createdAt).toLocaleTimeString(),
        'User Name': booking.user?.name || 'N/A',
        'User Email': booking.user?.email || 'N/A',
        'User Type': booking.user?.role || 'N/A',
        'Slot Number': booking.slot?.slotNumber || 'N/A',
        'City': booking.slot?.city || 'N/A',
        'Area': booking.slot?.area || 'N/A',
        'Address': booking.slot?.address || 'N/A',
        'Place Type': booking.slot?.placeType || 'N/A',
        'Vehicle Number': booking.vehicleNumber,
        'Start Time': new Date(booking.startTime).toLocaleString(),
        'End Time': new Date(booking.endTime).toLocaleString(),
        'Parking Status': booking.parkingStatus,
        'Booking Status': booking.status,
        'Duration (min)': booking.actualDuration || 'N/A',
        'Amount': booking.payment?.amount || 0,
        'Payment Method': booking.payment?.method || 'N/A',
        'Payment Status': booking.payment?.status || 'N/A',
        'Transaction ID': booking.payment?.transactionId || 'N/A'
    }));

    return csvRows;
};

/**
 * Get personal statistics for a user
 */
const getPersonalStats = async (userId) => {
    try {
        const bookings = await Booking.find({ user: userId })
            .populate('slot', 'slotNumber city area address placeType')
            .sort({ createdAt: -1 });

        const totalBookings = bookings.length;
        const totalSpent = bookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
        const averageDuration = calculateAverageDuration(bookings);

        // Find favorite location
        const locationCounts = {};
        bookings.forEach(b => {
            const loc = b.slot?.address || 'Unknown';
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });
        const favoriteLocation = Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Last 30 days data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentBookings = bookings.filter(b =>
            new Date(b.createdAt) >= thirtyDaysAgo
        );

        const timeSeriesData = generateTimeSeriesData(
            recentBookings,
            thirtyDaysAgo,
            new Date()
        );

        // Most used time slots
        const peakHours = calculatePeakHours(bookings);

        return {
            summary: {
                totalBookings,
                totalSpent: parseFloat(totalSpent.toFixed(2)),
                averageDuration: parseFloat(averageDuration.toFixed(2)),
                favoriteLocation,
                activeBookings: bookings.filter(b => b.parkingStatus === 'CHECKED_IN').length,
                completedBookings: bookings.filter(b => b.status === 'COMPLETED').length
            },
            timeSeries: timeSeriesData,
            peakHours: peakHours.distribution.slice(0, 5), // Top 5 hours
            recentBookings: recentBookings.slice(0, 10).map(b => ({
                id: b._id,
                slotNumber: b.slot?.slotNumber,
                date: b.createdAt,
                amount: b.payment?.amount || 0,
                status: b.status
            }))
        };
    } catch (error) {
        console.error("Error getting personal stats:", error);
        throw new Error("Failed to get personal statistics");
    }
};

module.exports = {
    generateUsageReport,
    calculatePeakHours,
    calculateAverageDuration,
    segmentByUserType,
    segmentBySlot,
    segmentByLocation,
    generateCSVData,
    getPersonalStats
};
