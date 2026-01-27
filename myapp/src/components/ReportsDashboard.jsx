import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DateRangePicker from './DateRangePicker';
import { fetchUsageReport, exportReportCSV, fetchSlots } from '../api';
import './ReportsDashboard.css';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];

const ReportsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Date range state
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });

    // Filter state
    const [filters, setFilters] = useState({
        slotId: '',
        userType: 'all',
        city: '',
        area: '',
        address: ''
    });

    const [slots, setSlots] = useState([]);
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        loadSlots();
    }, []);

    useEffect(() => {
        loadReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, filters]);

    const loadSlots = async () => {
        try {
            const slotsData = await fetchSlots();
            setSlots(slotsData);

            // Extract unique cities, areas, addresses
            const uniqueCities = [...new Set(slotsData.map(s => s.city))];
            setCities(uniqueCities);
        } catch (err) {
            console.error('Error loading slots:', err);
        }
    };

    const loadReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchUsageReport(startDate, endDate, filters);
            setReportData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSelect = (start, end) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));

        // Update cascading filters
        if (key === 'city') {
            const citySlots = slots.filter(s => s.city === value);
            const uniqueAreas = [...new Set(citySlots.map(s => s.area))];
            setAreas(uniqueAreas);
            setFilters(prev => ({ ...prev, area: '', address: '' }));
        }

        if (key === 'area') {
            const areaSlots = slots.filter(s => s.area === value);
            const uniqueAddresses = [...new Set(areaSlots.map(s => s.address))];
            setAddresses(uniqueAddresses);
            setFilters(prev => ({ ...prev, address: '' }));
        }
    };

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            await exportReportCSV(startDate, endDate, filters);
            alert('✓ Report exported successfully!');
        } catch (err) {
            alert('✗ Failed to export report: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    const handleResetFilters = () => {
        setFilters({
            slotId: '',
            userType: 'all',
            city: '',
            area: '',
            address: ''
        });
    };

    if (loading && !reportData) {
        return (
            <div className="reports-loading">
                <div className="spinner"></div>
                <p>Loading report data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-error">
                <p>⚠️ Error: {error}</p>
                <button onClick={loadReport} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="reports-dashboard">
            <div className="reports-header">
                <h2>📊 Usage Reports & Analytics</h2>
                <button
                    onClick={handleExportCSV}
                    className="export-btn"
                    disabled={exporting}
                >
                    {exporting ? '⏳ Exporting...' : '📥 Export to CSV'}
                </button>
            </div>

            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onQuickSelect={handleQuickSelect}
            />

            {/* Filters */}
            <div className="report-filters">
                <h3>🔍 Filters</h3>
                <div className="filters-grid">
                    <div className="filter-item">
                        <label>Slot:</label>
                        <select
                            value={filters.slotId}
                            onChange={(e) => handleFilterChange('slotId', e.target.value)}
                        >
                            <option value="">All Slots</option>
                            {slots.map(slot => (
                                <option key={slot._id} value={slot._id}>
                                    {slot.slotNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>User Type:</label>
                        <select
                            value={filters.userType}
                            onChange={(e) => handleFilterChange('userType', e.target.value)}
                        >
                            <option value="all">All Users</option>
                            <option value="user">Regular Users</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>City:</label>
                        <select
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>Area:</label>
                        <select
                            value={filters.area}
                            onChange={(e) => handleFilterChange('area', e.target.value)}
                            disabled={!filters.city}
                        >
                            <option value="">All Areas</option>
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>Address:</label>
                        <select
                            value={filters.address}
                            onChange={(e) => handleFilterChange('address', e.target.value)}
                            disabled={!filters.area}
                        >
                            <option value="">All Addresses</option>
                            {addresses.map(addr => (
                                <option key={addr} value={addr}>{addr}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <button onClick={handleResetFilters} className="reset-filters-btn">
                            🔄 Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <>
                    {/* Summary Metrics */}
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-icon">📊</div>
                            <div className="metric-content">
                                <span className="metric-value">{reportData.summary.totalBookings}</span>
                                <span className="metric-label">Total Bookings</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">💰</div>
                            <div className="metric-content">
                                <span className="metric-value">₹{reportData.summary.totalRevenue}</span>
                                <span className="metric-label">Total Revenue</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">⏱️</div>
                            <div className="metric-content">
                                <span className="metric-value">{reportData.summary.averageDuration} min</span>
                                <span className="metric-label">Avg Duration</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🔥</div>
                            <div className="metric-content">
                                <span className="metric-value">{reportData.peakHours.peakHour}</span>
                                <span className="metric-label">Peak Hour</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🚗</div>
                            <div className="metric-content">
                                <span className="metric-value">{reportData.summary.activeBookings}</span>
                                <span className="metric-label">Active Bookings</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">✅</div>
                            <div className="metric-content">
                                <span className="metric-value">{reportData.summary.completedBookings}</span>
                                <span className="metric-label">Completed</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="charts-grid">
                        {/* Bookings Over Time */}
                        <div className="chart-card">
                            <h3>📈 Bookings Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reportData.timeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="bookings" stroke="#4CAF50" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue Over Time */}
                        <div className="chart-card">
                            <h3>💵 Revenue Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.timeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#2196F3" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Peak Hours Distribution */}
                        <div className="chart-card">
                            <h3>🕐 Peak Hours Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.peakHours.distribution.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timeLabel" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#FF9800" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Booking Status Distribution */}
                        <div className="chart-card">
                            <h3>📊 Booking Status</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Booked', value: reportData.segmentation.byStatus.BOOKED },
                                            { name: 'Completed', value: reportData.segmentation.byStatus.COMPLETED },
                                            { name: 'Cancelled', value: reportData.segmentation.byStatus.CANCELLED }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Slots by Usage */}
                        <div className="chart-card full-width">
                            <h3>🏆 Top Slots by Usage</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.segmentation.bySlot.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="slotNumber" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#9C27B0" name="Bookings" />
                                    <Bar dataKey="revenue" fill="#00BCD4" name="Revenue (₹)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Location-based Bookings */}
                        <div className="chart-card full-width">
                            <h3>📍 Bookings by Location</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.segmentation.byLocation.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="address" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#4CAF50" name="Bookings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportsDashboard;
