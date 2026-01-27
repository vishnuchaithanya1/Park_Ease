const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    slotNumber: { type: String, required: true, unique: true },
    isAvailable: { type: Boolean, default: true },
    latitude: { type: Number }, // Real GPS Latitude
    longitude: { type: Number }, // Real GPS Longitude
    location: {
        x: Number,
        y: Number
    },
    city: {
        type: String,
        required: true,
        default: 'Hyderabad'
    },
    area: {
        type: String,
        required: true,
        default: 'Madhapur'
    },
    address: {
        type: String,
        required: true,
        default: 'Smart Parking Complex'
    },
    placeType: {
        type: String,
        enum: ['Shopping Mall', 'Cinema', 'Hospital', 'Metro Station', 'Market', 'Office Complex', 'Restaurant', 'Airport', 'Railway Station'],
        default: 'Shopping Mall'
    },
    imageUrl: { type: String },
    section: {
        type: String,
        default: 'General'
    }
});

// Indexes for performance
slotSchema.index({ city: 1, area: 1, isAvailable: 1 }); // Location-based searches
slotSchema.index({ isAvailable: 1 }); // Filter available slots
slotSchema.index({ slotNumber: 1 }, { unique: true }); // Ensure uniqueness

module.exports = mongoose.model("Slot", slotSchema);