import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../api';
import FeeDetails from './FeeDetails';
import PaymentModal from './PaymentModal';
import ParkingActions from './ParkingActions';
import LiveParkingTimer from './LiveParkingTimer';
import TicketModal from './TicketModal';
import { calculateFee } from '../utils/feeUtils';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFeeDetails, setShowFeeDetails] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    const [ticketBooking, setTicketBooking] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    // Add interval to update checked-in bookings every second so fee updates in real-time
    useEffect(() => {
        const hasCheckedInBookings = bookings.some(b => b.parkingStatus === 'CHECKED_IN');

        if (hasCheckedInBookings) {
            const interval = setInterval(() => {
                // Force re-render to update fees
                setBookings(prev => [...prev]);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [bookings]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const data = await getMyBookings(token);

            // Ensure bookings is an array and filter out invalid/dummy data if any
            const sanitizedBookings = (Array.isArray(data) ? data : []).map(booking => ({
                ...booking,
                _id: booking.id || booking._id,
                parkingStatus: booking.parkingStatus || 'SCHEDULED' // Default to SCHEDULED if undefined
            }));

            setBookings(sanitizedBookings);
            setError(null);
        } catch (err) {
            console.error('Failed to load bookings:', err);
            setError('Failed to load bookings. Please try again.');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleActionComplete = () => {
        loadBookings(); // Refresh list after check-in/out
    };

    const handleViewFee = (booking) => {
        setSelectedBooking(booking);
        setShowFeeDetails(true);
    };

    const handlePayNow = (booking) => {
        setSelectedBooking(booking);
        setShowPayment(true);
    };

    const handleViewTicket = (booking) => {
        setTicketBooking(booking);
        setShowTicket(true);
    };

    const handlePaymentComplete = () => {
        setShowPayment(false);
        setSelectedBooking(null);
        loadBookings();
    };

    return (
        <div className="bookings-container">
            <h2>My Bookings</h2>

            {loading && <div className="loading">Loading bookings...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && bookings.length === 0 && (
                <div className="no-bookings">No bookings found.</div>
            )}

            <div className="bookings-list">
                {bookings.map(booking => {
                    const isCompleted = booking.status === 'COMPLETED';
                    const isCheckedIn = booking.parkingStatus === 'CHECKED_IN';

                    return (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <div className="slot-badge">
                                    Slot {booking.slot?.slotNumber || 'N/A'}
                                </div>
                                <div className="status-badges">
                                    <span className={`parking-status-badge ${booking.parkingStatus?.toLowerCase().replace('_', '-')}`}>
                                        {booking.parkingStatus?.replace('_', ' ') || 'SCHEDULED'}
                                    </span>
                                    <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>

                            <div className="booking-location">
                                📍 {booking.slot?.address || 'Location unavailable'}
                            </div>

                            <div className="booking-details">
                                <div className="detail-row highlight">
                                    <span className="label">Vehicle</span>
                                    <span className="value">{booking.vehicleNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Start Time</span>
                                    <span className="value">{new Date(booking.startTime).toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">End Time</span>
                                    <span className="value">{new Date(booking.endTime).toLocaleString()}</span>
                                </div>

                                {booking.actualEntryTime && (
                                    <div className="detail-row" style={{ borderLeft: '3px solid #10b981' }}>
                                        <span className="label">Actual Entry</span>
                                        <span className="value">{new Date(booking.actualEntryTime).toLocaleTimeString()}</span>
                                    </div>
                                )}

                                {/* Live Timer Integration */}
                                {isCheckedIn && booking.actualEntryTime && (
                                    <LiveParkingTimer actualEntryTime={booking.actualEntryTime} />
                                )}

                                {booking.payment && (
                                    <div className="detail-row fee-row">
                                        <span className="label">Total Fee</span>
                                        <span className="value fee-amount">₹{calculateFee(booking).amount}</span>
                                    </div>
                                )}
                            </div>

                            <div className="booking-actions">
                                {/* Ticket Button - Always Visible */}
                                <button
                                    className="action-btn view-ticket-btn"
                                    onClick={() => handleViewTicket(booking)}
                                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
                                >
                                    🎟️ Ticket
                                </button>

                                {/* Standard Parking Actions (Check In/Out) */}
                                {(booking.parkingStatus === 'SCHEDULED' || isCheckedIn || !booking.parkingStatus) && (
                                    <ParkingActions
                                        booking={booking}
                                        onActionComplete={handleActionComplete}
                                    />
                                )}

                                {isCompleted && (
                                    <button
                                        className="action-btn view-fee-btn"
                                        onClick={() => handleViewFee(booking)}
                                    >
                                        View Fee Details
                                    </button>
                                )}

                                {isCompleted && booking.payment?.status === 'pending' && (
                                    <button
                                        className="action-btn pay-now-btn"
                                        onClick={() => handlePayNow(booking)}
                                    >
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {showFeeDetails && selectedBooking && (
                <FeeDetails
                    bookingId={selectedBooking._id}
                    onClose={() => setShowFeeDetails(false)}
                />
            )}

            {showPayment && selectedBooking && (
                <PaymentModal
                    booking={selectedBooking}
                    onClose={() => setShowPayment(false)}
                    onPaymentComplete={handlePaymentComplete}
                />
            )}

            {showTicket && ticketBooking && (
                <TicketModal
                    booking={ticketBooking}
                    onClose={() => setShowTicket(false)}
                />
            )}
        </div>
    );
};

export default MyBookings;
