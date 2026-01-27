import React, { useState, useEffect, useCallback } from 'react';
import { getFeeDetails } from '../api';
import './FeeDetails.css';

const FeeDetails = ({ bookingId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feeData, setFeeData] = useState(null);

    const loadFeeDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getFeeDetails(bookingId);
            setFeeData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        loadFeeDetails();
    }, [loadFeeDetails]);

    if (loading) {
        return (
            <div className="fee-details-overlay">
                <div className="fee-details-modal">
                    <div className="loading">Loading fee details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fee-details-overlay">
                <div className="fee-details-modal">
                    <div className="error">{error}</div>
                    <button onClick={onClose} className="close-btn">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fee-details-overlay" onClick={onClose}>
            <div className="fee-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>💰 Fee Details</h3>
                    <button onClick={onClose} className="close-icon">✕</button>
                </div>

                <div className="fee-content">
                    {/* Booking Info */}
                    <div className="info-section">
                        <h4>Booking Information</h4>
                        <div className="info-row">
                            <span className="label">Slot:</span>
                            <span className="value">#{feeData?.booking?.slotNumber || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Vehicle:</span>
                            <span className="value">{feeData?.booking?.vehicleNumber || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Duration Info */}
                    <div className="info-section">
                        <h4>Parking Duration</h4>
                        <div className="info-row">
                            <span className="label">Entry Time:</span>
                            <span className="value">
                                {feeData?.booking?.actualEntryTime ? new Date(feeData.booking.actualEntryTime).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Exit Time:</span>
                            <span className="value">
                                {feeData?.booking?.actualExitTime ? new Date(feeData.booking.actualExitTime).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        <div className="info-row highlight">
                            <span className="label">Total Duration:</span>
                            <span className="value">{feeData?.duration?.formatted || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="info-section">
                        <h4>Fee Breakdown</h4>
                        <div className="info-row">
                            <span className="label">Actual Duration:</span>
                            <span className="value">{feeData?.fee?.actualDuration || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Rounded Duration:</span>
                            <span className="value">{feeData?.fee?.roundedDuration || 'N/A'}</span>
                        </div>
                        {feeData?.fee?.breakdown && (
                            <div className="breakdown-details">
                                <p>{feeData.fee.breakdown}</p>
                            </div>
                        )}
                    </div>

                    {/* Pricing Info */}
                    {feeData.pricing && (
                        <div className="info-section">
                            <h4>Pricing Information</h4>
                            <div className="pricing-info">
                                <p>{feeData.pricing.description || 'Standard parking rates apply'}</p>
                            </div>
                        </div>
                    )}

                    {/* Total Amount */}
                    <div className="total-section">
                        <span className="total-label">Total Amount:</span>
                        <span className="total-amount">
                            ₹{feeData?.fee?.amount ? feeData.fee.amount.toFixed(2) : '0.00'}
                        </span>
                    </div>

                    {/* Payment Status */}
                    {feeData.payment && (
                        <div className="payment-status">
                            <span className={`status-badge ${feeData.payment.status}`}>
                                {feeData.payment.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                            {feeData.payment.transactionId && (
                                <span className="transaction-id">
                                    TXN: {feeData.payment.transactionId}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="close-btn">Close</button>
            </div>
        </div>
    );
};

export default FeeDetails;
