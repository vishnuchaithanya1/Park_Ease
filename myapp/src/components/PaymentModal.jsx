import React, { useState } from 'react';
import { processPayment } from '../api';
import './PaymentModal.css';

const PaymentModal = ({ booking, amount, onPaymentComplete, onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const paymentMethods = [
        { id: 'upi', name: 'UPI', icon: '📱' },
        { id: 'credit_card', name: 'Credit Card', icon: '💳' },
        { id: 'paypal', name: 'PayPal', icon: '🅿️' }
    ];

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await processPayment(booking._id, paymentMethod);

            if (response.success) {
                // Payment successful
                setTimeout(() => {
                    onPaymentComplete(response.payment);
                }, 1000);
            } else {
                setError(response.message || 'Payment failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-header">
                    <h3>💳 Process Payment</h3>
                    <button onClick={onClose} className="close-icon">✕</button>
                </div>

                <div className="payment-content">
                    {/* Booking Summary */}
                    <div className="booking-summary">
                        <h4>Booking Summary</h4>
                        <div className="summary-row">
                            <span>Slot:</span>
                            <span>#{booking.slot?.slotNumber || booking.slotNumber}</span>
                        </div>
                        <div className="summary-row">
                            <span>Vehicle:</span>
                            <span>{booking.vehicleNumber}</span>
                        </div>
                        {booking.actualDuration && (
                            <div className="summary-row">
                                <span>Duration:</span>
                                <span>{Math.floor(booking.actualDuration / 60)}h {booking.actualDuration % 60}m</span>
                            </div>
                        )}
                    </div>

                    {/* Amount Display */}
                    <div className="amount-display">
                        <span className="amount-label">Total Amount</span>
                        <span className="amount-value">₹{amount?.toFixed(2) || booking.payment?.amount?.toFixed(2) || '0.00'}</span>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="payment-methods">
                        <h4>Select Payment Method</h4>
                        <div className="method-options">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`method-option ${paymentMethod === method.id ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="method-icon">{method.icon}</span>
                                    <span className="method-name">{method.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="payment-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="payment-actions">
                        <button
                            onClick={handlePayment}
                            className="pay-btn"
                            disabled={loading}
                        >
                            {loading ? '⏳ Processing...' : '✓ Confirm Payment'}
                        </button>
                        <button
                            onClick={onClose}
                            className="cancel-btn"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Payment Note */}
                    <div className="payment-note">
                        <p>💡 This is a simulated payment for demonstration purposes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
