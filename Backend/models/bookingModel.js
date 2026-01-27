const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    // Parking Timer Fields
    actualEntryTime: {
        type: Date,
    },
    actualExitTime: {
        type: Date,
    },
    actualDuration: {
        type: Number, // Duration in minutes
    },
    parkingStatus: {
        type: String,
        enum: ["SCHEDULED", "CHECKED_IN", "CHECKED_OUT"],
        default: "SCHEDULED",
    },
    status: {
        type: String,
        enum: ["BOOKED", "COMPLETED", "CANCELLED"],
        default: "BOOKED",
    },
    payment: {
        amount: {
            type: Number,
            default: 0,
        },
        method: {
            type: String,
            enum: ["credit_card", "paypal", "upi", "none"],
            default: "none",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        transactionId: {
            type: String,
        },
        paidAt: {
            type: Date,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for performance
BookingSchema.index({ user: 1, createdAt: -1 }); // User's bookings sorted by date
BookingSchema.index({ slot: 1, startTime: 1, endTime: 1 }); // Slot availability checks
BookingSchema.index({ parkingStatus: 1 }); // Filter by parking status
BookingSchema.index({ status: 1 }); // Filter by booking status
BookingSchema.index({ 'payment.status': 1 }); // Filter by payment status

module.exports = mongoose.model("Booking", BookingSchema);
