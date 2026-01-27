import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './AdminAnalytics.css';

const AdminAnalytics = ({ data }) => {
    if (!data || !data.revenueData) {
        return <div className="no-data">No analytics data available for charts</div>;
    }

    return (
        <div className="analytics-charts-container">
            <div className="chart-wrapper">
                <h3>📅 Daily Bookings (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                        <YAxis allowDecimals={false} />
                        <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                        <Legend />
                        <Bar dataKey="bookings" fill="#667eea" name="Bookings" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
                <h3>💰 Revenue Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                        <YAxis prefix="₹" />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#48bb78" strokeWidth={3} name="Revenue" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminAnalytics;
