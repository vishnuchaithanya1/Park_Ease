/**
 * Payment Simulation Service
 * Simulates payment processing (no real money)
 * Generates transaction IDs and simulates success/failure
 */

const { v4: uuidv4 } = require('uuid');

class PaymentSimulationService {
    constructor() {
        this.successRate = 0.9; // 90% success rate
    }

    /**
     * Simulates payment processing
     * Returns success/failure status with transaction ID
     * 
     * @param {number} amount - Payment amount
     * @param {string} bookingId - Booking ID
     * @returns {Promise<Object>} Payment result { success, transactionId, message }
     */
    async processPayment(amount, bookingId) {
        console.log('\n💳 Processing payment...');
        console.log(`  Booking ID: ${bookingId}`);
        console.log(`  Amount: ₹${amount}`);

        // Simulate processing delay
        await this.delay(500);

        // Simulate payment success/failure (90% success rate)
        const isSuccess = Math.random() < this.successRate;

        if (isSuccess) {
            const transactionId = this.generateTransactionId();
            console.log('✓ Payment successful!');
            console.log(`  Transaction ID: ${transactionId}`);

            return {
                success: true,
                transactionId: transactionId,
                message: 'Payment completed successfully',
                status: 'completed'
            };
        } else {
            console.log('✗ Payment failed!');
            console.log('  Reason: Insufficient balance or network error');

            return {
                success: false,
                transactionId: null,
                message: 'Payment failed: Insufficient balance or network error',
                status: 'failed'
            };
        }
    }

    /**
     * Generates a unique transaction ID
     * Format: TXN-[8-character UUID]
     * @returns {string} Transaction ID
     */
    generateTransactionId() {
        const uuid = uuidv4().substring(0, 8).toUpperCase();
        return `TXN-${uuid}`;
    }

    /**
     * Simulates a delay (for realistic payment processing)
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Sets the success rate for payment simulation
     * @param {number} rate - Success rate (0.0 to 1.0)
     */
    setSuccessRate(rate) {
        if (rate >= 0 && rate <= 1) {
            this.successRate = rate;
        }
    }

    /**
     * Validates payment amount
     * @param {number} amount - Amount to validate
     * @returns {boolean} Whether amount is valid
     */
    validateAmount(amount) {
        return amount > 0 && Number.isFinite(amount);
    }
}

module.exports = new PaymentSimulationService();
