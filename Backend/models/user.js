const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vehicleNumber: { type: String }, // Optional for Admin
  vehicleType: { type: String },   // Optional for Admin
  phone: { type: String },         // Optional for Admin
  expiresAt: { type: Date },       // Account expiration (for temp Admins)
  // admin or user
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true }); // Email lookups
UserSchema.index({ vehicleNumber: 1 }, { unique: true, sparse: true }); // Vehicle lookups (sparse for admins without vehicles)
UserSchema.index({ role: 1 }); // Filter by role

module.exports = mongoose.model("User", UserSchema);