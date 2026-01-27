/**
 * Fee Calculation Service
 * Calculates parking fees based on duration
 * Pricing: ₹20 base fee + ₹5 per 15 minutes of actual usage
 * Rounds up to nearest 15-minute interval
 */

class FeeCalculationService {
    constructor() {
        this.BASE_FEE = 20.0;           // ₹20 base fee
        this.RATE_PER_15_MIN = 5.0;     // ₹5 per 15 minutes
    }

    /**
     * Calculates the parking fee based on duration
     * Logic:
     * 1. Get total duration in minutes
     * 2. Round up to nearest 15-minute interval
     * 3. Calculate fee: ₹20 base + (rounded minutes / 15) × ₹5
     * 
     * @param {number} durationMinutes - Parking duration in minutes
     * @returns {Object} Fee details { actualDuration, roundedDuration, fee }
     */
    calculateFee(durationMinutes) {
        if (durationMinutes <= 0) {
            console.log('✗ Error: Invalid duration');
            return {
                actualDuration: 0,
                roundedDuration: 0,
                fee: this.BASE_FEE  // Minimum charge is base fee
            };
        }

        // Round up to nearest 15-minute interval
        const roundedMinutes = this.roundUpTo15Minutes(durationMinutes);

        // Calculate fee: ₹20 base + (rounded minutes / 15) × ₹5
        const timeCharge = (roundedMinutes / 15.0) * this.RATE_PER_15_MIN;
        const fee = this.BASE_FEE + timeCharge;

        console.log('✓ Fee calculated:');
        console.log(`  Actual duration: ${durationMinutes} minutes`);
        console.log(`  Rounded to: ${roundedMinutes} minutes`);
        console.log(`  Base fee: ₹${this.BASE_FEE}`);
        console.log(`  Time charge: ₹${timeCharge}`);
        console.log(`  Total fee: ₹${fee}`);

        return {
            actualDuration: durationMinutes,
            roundedDuration: roundedMinutes,
            fee: fee
        };
    }

    /**
     * Rounds up duration to nearest 15-minute interval
     * Examples:
     * - 1-15 minutes → 15 minutes
     * - 16-30 minutes → 30 minutes
     * - 31-45 minutes → 45 minutes
     * - 46-60 minutes → 60 minutes
     * 
     * @param {number} minutes - Duration in minutes
     * @returns {number} Rounded duration
     */
    roundUpTo15Minutes(minutes) {
        if (minutes <= 0) {
            return 0;
        }

        // Round up to nearest 15-minute interval
        return Math.ceil(minutes / 15) * 15;
    }

    /**
     * Gets a breakdown of the fee calculation
     * @param {number} durationMinutes - Duration in minutes
     * @returns {string} Fee breakdown description
     */
    getFeeBreakdown(durationMinutes) {
        const roundedMinutes = this.roundUpTo15Minutes(durationMinutes);
        const timeCharge = (roundedMinutes / 15.0) * this.RATE_PER_15_MIN;
        const fee = this.BASE_FEE + timeCharge;

        const hours = Math.floor(roundedMinutes / 60);
        const minutes = roundedMinutes % 60;

        return `Duration: ${durationMinutes} min → Charged: ${roundedMinutes} min (${hours}h ${minutes}m) → Base: ₹${this.BASE_FEE} + Time: ₹${timeCharge} = Total: ₹${fee}`;
    }

    /**
     * Gets pricing information
     * @returns {Object} Pricing details
     */
    getPricingInfo() {
        return {
            baseFee: this.BASE_FEE,
            ratePer15Min: this.RATE_PER_15_MIN,
            minimumCharge: this.BASE_FEE,
            billingInterval: '15 minutes',
            description: `₹${this.BASE_FEE} base fee + ₹${this.RATE_PER_15_MIN} per 15 minutes`
        };
    }
}

module.exports = new FeeCalculationService();
