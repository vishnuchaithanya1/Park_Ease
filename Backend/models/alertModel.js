const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
    // Target - can be specific slot, area, or city-wide
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        default: null
    },
    area: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },

    // Alert content
    message: {
        type: String,
        required: true,
        maxlength: 500
    },

    // Alert classification
    type: {
        type: String,
        enum: ["construction", "maintenance", "closure", "warning", "info"],
        required: true
    },

    severity: {
        type: String,
        enum: ["info", "warning", "critical"],
        default: "info"
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queries
AlertSchema.index({ slot: 1, isActive: 1 });
AlertSchema.index({ area: 1, isActive: 1 });
AlertSchema.index({ city: 1, isActive: 1 });
AlertSchema.index({ expiresAt: 1 });

// Virtual to check if alert is expired
AlertSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Method to check if alert should be displayed
AlertSchema.methods.shouldDisplay = function () {
    if (!this.isActive) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    return true;
};

module.exports = mongoose.model("Alert", AlertSchema);
