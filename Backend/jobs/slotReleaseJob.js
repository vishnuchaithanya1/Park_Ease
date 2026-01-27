const cron = require('node-cron');
const Booking = require('../models/bookingModel');
const Slot = require('../models/slotModel');

/**
 * Background job to automatically release slots when booking time ends
 * Runs every minute to check for expired bookings
 */
const startSlotReleaseJob = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Find all active bookings where endTime has passed
            const expiredBookings = await Booking.find({
                status: 'BOOKED',
                endTime: { $lt: now }
            }).populate('slot');

            if (expiredBookings.length > 0) {
                console.log(`🔄 Found ${expiredBookings.length} expired booking(s). Releasing slots...`);

                for (const booking of expiredBookings) {
                    // Update booking status to COMPLETED
                    booking.status = 'COMPLETED';
                    await booking.save();

                    // Release the slot
                    if (booking.slot) {
                        await Slot.findByIdAndUpdate(booking.slot._id, {
                            isAvailable: true
                        });

                        console.log(`✅ Released slot ${booking.slot.slotNumber} (Booking ended at ${booking.endTime})`);
                    }
                }

                console.log(`✨ Successfully released ${expiredBookings.length} slot(s)`);
            }
        } catch (error) {
            console.error('❌ Error in slot release job:', error.message);
        }
    });

    console.log('🚀 Automatic slot release job started (runs every minute)');
};

module.exports = { startSlotReleaseJob };
