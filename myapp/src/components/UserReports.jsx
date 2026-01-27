import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fetchMyStats, exportMyCSV } from '../api';
import './UserReports.css';

const UserReports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchMyStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            await exportMyCSV();
            alert('✓ Your parking history exported successfully!');
        } catch (err) {
            alert('✗ Failed to export: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="user-reports-loading">
                <div className="spinner"></div>
                <p>Loading your statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-reports-error">
                <p>⚠️ Error: {error}</p>
                <button onClick={loadStats} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="user-reports">
            <div className="user-reports-header">
                <h2>📊 My Parking Statistics</h2>
                <button
                    onClick={handleExportCSV}
                    className="export-btn"
                    disabled={exporting}
                >
                    {exporting ? '⏳ Exporting...' : '📥 Export My Data'}
                </button>
            </div>

            {stats && (
                <>
                    {/* Personal Stats Cards */}
                    <div className="personal-stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.summary.totalBookings}</span>
                                <span className="stat-label">Total Bookings</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <span className="stat-value">₹{stats.summary.totalSpent}</span>
                                <span className="stat-label">Total Spent</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.summary.averageDuration} min</span>
                                <span className="stat-label">Avg Duration</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📍</div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.summary.favoriteLocation}</span>
                                <span className="stat-label">Favorite Location</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🚗</div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.summary.activeBookings}</span>
                                <span className="stat-label">Active Parkings</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.summary.completedBookings}</span>
                                <span className="stat-label">Completed</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="user-charts-grid">
                        {/* Booking History (Last 30 Days) */}
                        <div className="user-chart-card">
                            <h3>📈 My Booking History (Last 30 Days)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.timeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="bookings" stroke="#4CAF50" strokeWidth={2} name="Bookings" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Spending Trend */}
                        <div className="user-chart-card">
                            <h3>💵 My Spending Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.timeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#2196F3" name="Amount (₹)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Most Used Time Slots */}
                        <div className="user-chart-card full-width">
                            <h3>🕐 My Most Used Time Slots</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timeLabel" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#FF9800" name="Bookings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Bookings Table */}
                    <div className="recent-bookings-section">
                        <h3>📋 Recent Bookings</h3>
                        <div className="recent-bookings-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Slot</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>{booking.slotNumber}</td>
                                            <td>{new Date(booking.date).toLocaleDateString()}</td>
                                            <td>₹{booking.amount}</td>
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
                    </div>
                </>
            )}
        </div>
    );
};

export default UserReports;
