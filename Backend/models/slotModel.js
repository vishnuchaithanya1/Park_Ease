const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  isAvailable: { type: Boolean, default: true },
  location: {
    x: Number,
    y: Number,
  },
  imageUrl: { type: String },
});

module.exports = mongoose.model("Slot", slotSchema);
