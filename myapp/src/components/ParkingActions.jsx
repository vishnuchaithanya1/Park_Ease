import React, { useState } from 'react';
import { checkInBooking, checkOutBooking } from '../api';
import './ParkingActions.css';

const ParkingActions = ({ booking, onActionComplete }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleCheckIn = async () => {
        if (!window.confirm('Are you sure you want to check in now?')) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await checkInBooking(booking._id);
            const entryTime = new Date(response.booking.actualEntryTime);
            const formattedTime = entryTime.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            setMessage(`✓ Check-in successful at ${formattedTime}`);
            setIsError(false);

            // Notify parent to refresh booking data
            setTimeout(() => {
                if (onActionComplete) {
                    onActionComplete();
                }
            }, 1500);
        } catch (error) {
            setMessage(error.message || 'Check-in failed');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!window.confirm('Are you sure you want to check out now? Your parking fee will be calculated.')) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await checkOutBooking(booking._id);
            const exitTime = new Date(response.booking.actualExitTime);
            const formattedTime = exitTime.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const duration = response.booking.duration || '0h 0m';
            setMessage(`✓ Check-out successful at ${formattedTime} (Duration: ${duration})`);
            setIsError(false);

            // Notify parent to refresh booking data
            setTimeout(() => {
                if (onActionComplete) {
                    onActionComplete();
                }
            }, 1500);
        } catch (error) {
            setMessage(error.message || 'Check-out failed');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="parking-actions">
            {(booking.parkingStatus === 'SCHEDULED' || !booking.parkingStatus) && (
                <button
                    className="action-btn check-in-btn"
                    onClick={handleCheckIn}
                    disabled={loading}
                >
                    {loading ? '⏳ Checking in...' : '🚗 Check In'}
                </button>
            )}

            {booking.parkingStatus === 'CHECKED_IN' && (
                <button
                    className="action-btn check-out-btn"
                    onClick={handleCheckOut}
                    disabled={loading}
                >
                    {loading ? '⏳ Checking out...' : '🚪 Check Out'}
                </button>
            )}

            {message && (
                <div className={`action-message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ParkingActions;
