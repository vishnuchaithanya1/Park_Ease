const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");
const { validationSchemas, validate } = require("../middleware/validators");

const router = express.Router();
const SALT_ROUNDS = 10;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "SmartParkingAdmin2024";
const JWT_SECRET = process.env.JWT_SECRET || "smartparking_jwt_secret";

// TEMPORARY DEBUG ENDPOINT - Remove after testing
router.get("/debug-env", (req, res) => {
  res.json({
    jwtSecretLength: JWT_SECRET.length,
    jwtSecretFirst10: JWT_SECRET.substring(0, 10),
    jwtSecretLast10: JWT_SECRET.substring(JWT_SECRET.length - 10),
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
});

// REGISTER
router.post("/register", validationSchemas.register, validate, async (req, res) => {
  try {
    const { name, email, password, vehicleNumber, vehicleType, phone, role, adminSecret } =
      req.body;

    // Validate Admin Invite Token
    if (role === 'admin') {
      if (!adminSecret) {
        return res.status(403).json({ message: "Admin Invite Token is required." });
      }
      try {
        const decoded = jwt.verify(adminSecret, JWT_SECRET);
        if (decoded.role !== 'admin_invite') {
          throw new Error("Invalid token scope");
        }
      } catch (err) {
        return res.status(403).json({ message: "Invalid or Expired Admin Invite Token." });
      }
    }

    // Role-based validation
    const effectiveRole = role || 'user';
    if (effectiveRole === 'user') {
      if (!vehicleNumber) return res.status(400).json({ message: "Vehicle Number is required for Users." });
      if (!phone) return res.status(400).json({ message: "Phone Number is required for Users." });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedVehicle = vehicleNumber ? vehicleNumber.trim().toUpperCase() : vehicleNumber;

    // check if user already exists
    const query = [{ email: normalizedEmail }];
    if (normalizedVehicle) {
      query.push({ vehicleNumber: normalizedVehicle });
    }

    const existingUser = await User.findOne({ $or: query });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? "Email" : "Vehicle Number";
      return res.status(400).json({ message: `User already exists with this ${field}` });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      vehicleNumber: normalizedVehicle,
      vehicleType,
      phone,
      role: role || 'user', // Default to 'user' if not specified
      expiresAt: role === 'admin' ? Date.now() + 24 * 60 * 60 * 1000 : null // 24 hours for admin
    });

    await user.save();

    // Create JWT token (same as login)
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return token and user data (auto-login after registration)
    res.json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", validationSchemas.login, validate, async (req, res) => {
  try {
    logger.info("Login attempt for:", { email: req.body.email || req.body.identifier });
    const { email, vehicleNumber, identifier, password } = req.body;
    const loginId = (identifier || email || vehicleNumber || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: "Email/Vehicle Number and Password are required" });
    }

    // Try finding by email (lowercase) or vehicleNumber (uppercase)
    let user = await User.findOne({ email: loginId.toLowerCase() });
    if (!user) {
      user = await User.findOne({ vehicleNumber: loginId.toUpperCase() });
    }

    if (!user) {
      return res.status(400).json({ message: "No account found with this Email or Vehicle Number" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Check account expiration for Admin
    if (user.role === 'admin') {
      if (user.expiresAt && user.expiresAt < Date.now()) {
        return res.status(403).json({ message: "Admin access expired. Please contact support or re-register." });
      }

      // Verify Invite Token for Login
      const { adminSecret } = req.body;
      if (!adminSecret) {
        return res.status(403).json({ message: "Admin Token is required for login." });
      }
      try {
        const decoded = jwt.verify(adminSecret, JWT_SECRET);
        if (decoded.role !== 'admin_invite') {
          throw new Error("Invalid token scope");
        }
      } catch (err) {
        return res.status(403).json({ message: "Invalid or Expired Admin Token." });
      }
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h", // Increased to 24h for convenience
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
});

const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your dashboard!", user: req.user });
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROFILE
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, vehicleNumber, phone } = req.body;
    const userId = req.user.id;

    // Normalize inputs
    const normalizedEmail = normalizeEmail(email);
    const normalizedVehicle = vehicleNumber ? vehicleNumber.trim().toUpperCase() : vehicleNumber;

    // Check if email is already taken by another user
    if (normalizedEmail) {
      const existingEmailUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId } // Exclude current user
      });
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email is already in use by another account" });
      }
    }

    // Check if vehicle number is already taken by another user
    if (normalizedVehicle) {
      const existingVehicleUser = await User.findOne({
        vehicleNumber: normalizedVehicle,
        _id: { $ne: userId }
      });
      if (existingVehicleUser) {
        return res.status(400).json({ message: "Vehicle number is already registered to another account" });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (normalizedEmail) updateData.email = normalizedEmail;
    if (normalizedVehicle) updateData.vehicleNumber = normalizedVehicle;
    if (phone !== undefined) updateData.phone = phone.trim();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        vehicleNumber: updatedUser.vehicleNumber,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

function normalizeEmail(email) {
  return email ? email.trim().toLowerCase() : email;
}

// // GET /api/user/vehicle → Return vehicle details
// router.get("/vehicle", authMiddleware, async (req, res) => {
//   try {
//     // If authMiddleware sets req.user with id or full user object:
//     // prefer fresh data (without password)
//     const user = await User.findById(req.user.id || req.user._id).select(
//       "vehicleNumber vehicleType"
//     );

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({
//       vehicleNumber: user.vehicleNumber || "Not provided",
//       vehicleType: user.vehicleType || "Not provided",
//     });
//   } catch (error) {
//     console.error("Vehicle route error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
