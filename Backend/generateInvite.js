const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "smartparking_jwt_secret";

const generateInviteToken = () => {
    // invite token valid for 24 hours
    const token = jwt.sign(
        { role: 'admin_invite', issuer: 'SmartParkingSystem' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log('\n================================================');
    console.log('🎟️  ADMIN INVITE TOKEN GENERATED');
    console.log('================================================');
    console.log(token);
    console.log('================================================');
    console.log('⚠️  Share this token ONLY with authorized admin staff.');
    console.log('⏳  Valid for 24 hours.\n');

    const fs = require('fs');
    fs.writeFileSync('invite_token.txt', token);
    console.log('(Token also saved to invite_token.txt)');
};

generateInviteToken();
