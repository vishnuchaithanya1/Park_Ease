// Quick script to create an admin user
// Run this file with: node createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    vehicleNumber: String,
    vehicleType: String,
    phone: String,
    role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Admin details - CHANGE THESE!
const adminData = {
    name: "Admin User",
    email: "admin@parking.com",
    password: "admin123",  // Will be hashed
    vehicleNumber: "ADMIN001",
    vehicleType: "car",
    phone: "1234567890",
    role: "admin"
};

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);

            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin role!');
            }

            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Create admin user
        const admin = new User({
            ...adminData,
            password: hashedPassword
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', adminData.password);
        console.log('👤 Role:', adminData.role);
        console.log('\n🎉 You can now login as admin!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
