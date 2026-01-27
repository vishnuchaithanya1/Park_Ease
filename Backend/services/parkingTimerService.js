/**
 * Parking Timer Service
 * Handles entry/exit time recording and duration calculation
 * JavaScript version of the Java ParkingTimerService
 */

class ParkingTimerService {
    /**
     * Records the entry time for a booking
     * @param {Object} booking - Booking object
     * @returns {Date} Entry time
     */
    recordEntryTime(booking) {
        const entryTime = new Date();
        booking.actualEntryTime = entryTime;
        console.log(`✓ Entry time recorded: ${entryTime.toISOString()}`);
        return entryTime;
    }

    /**
     * Records the exit time for a booking
     * @param {Object} booking - Booking object
     * @returns {Date} Exit time
     */
    recordExitTime(booking) {
        const exitTime = new Date();
        booking.actualExitTime = exitTime;
        console.log(`✓ Exit time recorded: ${exitTime.toISOString()}`);
        return exitTime;
    }

    /**
     * Calculates parking duration in minutes
     * Logic: Duration = Exit Time - Entry Time (in minutes)
     * @param {Date} entryTime - Entry timestamp
     * @param {Date} exitTime - Exit timestamp
     * @returns {number} Duration in minutes
     */
    calculateDuration(entryTime, exitTime) {
        if (!entryTime || !exitTime) {
            console.log('✗ Error: Entry time or exit time not set');
            return 0;
        }

        // Calculate difference in milliseconds
        const diffMs = exitTime - entryTime;

        // Convert to minutes
        const durationMinutes = Math.floor(diffMs / (1000 * 60));

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        console.log(`✓ Parking duration calculated: ${hours} hour(s) ${minutes} minute(s)`);
        console.log(`  Total: ${durationMinutes} minutes`);

        return durationMinutes;
    }

    /**
     * Gets a formatted string of the parking duration
     * @param {number} durationMinutes - Duration in minutes
     * @returns {string} Formatted duration
     */
    getFormattedDuration(durationMinutes) {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return `${hours}h ${minutes}m`;
    }
}

module.exports = new ParkingTimerService();
