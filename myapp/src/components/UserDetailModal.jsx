import React from 'react';
import './UserDetailModal.css';

const UserDetailModal = ({ userDetails, onClose }) => {
    if (!userDetails) return null;

    const { user, statistics, bookings } = userDetails;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="user-detail-overlay" onClick={onClose}>
            <div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>👤 User Details</h2>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="modal-content">
                    {/* User Information */}
                    <div className="info-section">
                        <h3>Personal Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{user.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{user.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{user.phone || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Role:</span>
                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Vehicle Number:</span>
                                <span className="info-value">{user.vehicleNumber || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Vehicle Type:</span>
                                <span className="info-value">{user.vehicleType || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Account Created:</span>
                                <span className="info-value">{formatDate(user.createdAt)}</span>
                            </div>
                            {user.expiresAt && (
                                <div className="info-item">
                                    <span className="info-label">Expires At:</span>
                                    <span className="info-value">{formatDate(user.expiresAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="stats-section">
                        <h3>Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-value">{statistics.totalBookings}</div>
                                <div className="stat-label">Total Bookings</div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon">✅</div>
                                <div className="stat-value">{statistics.activeBookings}</div>
                                <div className="stat-label">Active</div>
                            </div>
                            <div className="stat-card blue">
                                <div className="stat-icon">✔️</div>
                                <div className="stat-value">{statistics.completedBookings}</div>
                                <div className="stat-label">Completed</div>
                            </div>
                            <div className="stat-card purple">
                                <div className="stat-icon">💰</div>
                                <div className="stat-value">₹{statistics.totalSpent}</div>
                                <div className="stat-label">Total Spent</div>
                            </div>
                        </div>
                    </div>

                    {/* Booking History */}
                    <div className="bookings-section">
                        <h3>Booking History ({bookings.length})</h3>
                        {bookings.length === 0 ? (
                            <div className="no-bookings">No bookings yet</div>
                        ) : (
                            <div className="bookings-table-container">
                                <table className="bookings-table">
                                    <thead>
                                        <tr>
                                            <th>Slot</th>
                                            <th>Location</th>
                                            <th>Vehicle</th>
                                            <th>Date</th>
                                            <th>Duration</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>{booking.slotNumber}</td>
                                                <td>
                                                    {booking.location}
                                                    <br />
                                                    <small>{booking.city}</small>
                                                </td>
                                                <td>{booking.vehicleNumber}</td>
                                                <td>{formatDate(booking.startTime)}</td>
                                                <td>{formatDuration(booking.actualDuration)}</td>
                                                <td>₹{booking.paymentAmount.toFixed(2)}</td>
                                                <td>
                                                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
