import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './PaymentSummary.css';

const PaymentSummary = ({ booking, onPaymentComplete, onCancel }) => {
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        calculatePayment();
        const cleanup = startTimer();
        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking]);

    const calculatePayment = async () => {
        try {
            setLoading(true);

            // Use actual times if available (from check-in/check-out), otherwise use scheduled times
            const startTime = booking.actualEntryTime || booking.startTime;
            const endTime = booking.actualExitTime || booking.endTime;
            const duration = booking.actualDuration; // Duration in minutes from backend

            // If we have actual duration from check-out, use it directly
            if (duration && booking.actualExitTime) {
                const durationHours = duration / 60;
                const amount = Math.ceil(durationHours * 4) * 5; // ₹20 per hour = ₹5 per 15 min
                setPaymentData({
                    durationHours: durationHours,
                    amount: amount,
                    breakdown: `${duration} minutes (${Math.floor(duration / 60)}h ${duration % 60}m) × ₹20/hour = ₹${amount}`
                });
                setLoading(false);
                return;
            }

            // Otherwise calculate from times
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/payments/calculate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        startTime: startTime,
                        endTime: endTime
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to calculate payment');
            }
            setPaymentData(data);
        } catch (err) {
            setError(err.message || 'Failed to calculate payment');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        const updateTimer = () => {
            const now = new Date();
            const start = new Date(booking.actualEntryTime || booking.startTime);

            // If vehicle is checked in, show elapsed time
            if (booking.actualEntryTime && !booking.actualExitTime) {
                const diff = now - start;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeRemaining({ hours, minutes, seconds });
            }
            // If checked out, show total duration
            else if (booking.actualExitTime) {
                const diff = new Date(booking.actualExitTime) - start;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeRemaining({ hours, minutes, seconds });
            }
            // Otherwise show countdown to scheduled start
            else {
                const diff = start - now;
                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeRemaining({ hours, minutes, seconds });
                } else {
                    setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
                }
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    };

    const handleStartParking = async () => {
        try {
            setProcessing(true);
            setError('');

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/payments/process`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bookingId: booking._id,
                        amount: paymentData.amount,
                        method: paymentMethod
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Payment failed');
            }

            if (onPaymentComplete) {
                onPaymentComplete(data);
            }
        } catch (err) {
            setError(err.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="payment-loading">Calculating payment...</div>;
    }

    const displayStartTime = booking.actualEntryTime || booking.startTime;

    return (
        <div className="payment-summary-container">
            <div className="payment-summary-card">
                <h2 className="payment-title">Parking Timer</h2>

                {/* Timer Display */}
                <div className="parking-timer">
                    <div className="timer-unit">
                        <div className="timer-value">{String(timeRemaining.hours).padStart(2, '0')}</div>
                        <div className="timer-label">Hours</div>
                    </div>
                    <div className="timer-separator">:</div>
                    <div className="timer-unit">
                        <div className="timer-value">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                        <div className="timer-label">Minutes</div>
                    </div>
                    <div className="timer-separator">:</div>
                    <div className="timer-unit">
                        <div className="timer-value">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                        <div className="timer-label">Seconds</div>
                    </div>
                </div>

                <p className="parking-start-time">
                    {booking.actualEntryTime
                        ? `Vehicle entered at ${new Date(displayStartTime).toLocaleTimeString()}`
                        : `Parking starts at ${new Date(displayStartTime).toLocaleTimeString()}`
                    }
                </p>

                {/* Payment Summary */}
                <div className="payment-summary-section">
                    <h3>Payment Summary</h3>
                    <div className="summary-row">
                        <span className="summary-label">Parking Duration:</span>
                        <span className="summary-value">{paymentData?.durationHours.toFixed(2)} hours</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Estimated Fee:</span>
                        <span className="summary-value estimated-fee">₹{paymentData?.amount.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-text">{paymentData?.breakdown}</div>
                </div>

                {/* Payment Method Selection */}
                <div className="payment-method-section">
                    <h3>Payment Method</h3>
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit_card"
                                checked={paymentMethod === 'credit_card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="payment-option-content">
                                <span className="payment-icon">💳</span>
                                <span className="payment-label">Credit Card</span>
                            </div>
                        </label>

                        <label className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="paypal"
                                checked={paymentMethod === 'paypal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="payment-option-content">
                                <span className="payment-icon">📱</span>
                                <span className="payment-label">PayPal</span>
                            </div>
                        </label>

                        <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="upi"
                                checked={paymentMethod === 'upi'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="payment-option-content">
                                <span className="payment-icon">🏦</span>
                                <span className="payment-label">UPI</span>
                            </div>
                        </label>
                    </div>
                </div>

                {error && <div className="payment-error">{error}</div>}

                {/* Action Buttons */}
                <div className="payment-actions">
                    <button
                        className="start-parking-btn"
                        onClick={handleStartParking}
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : 'Start Parking'}
                    </button>
                    {onCancel && (
                        <button className="cancel-btn" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
