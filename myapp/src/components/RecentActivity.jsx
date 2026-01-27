import React, { useEffect, useState } from 'react';
import './RecentActivity.css';

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/analytics/activity', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error("Failed to load activity:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="activity-loading">Loading recent activity...</div>;

    return (
        <div className="recent-activity-container">
            <h3>🕒 Recent Activity</h3>
            <div className="activity-list">
                {activities.length === 0 ? (
                    <div className="no-activity">No recent activity</div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className={`activity-icon ${activity.status.toLowerCase()}`}>
                                {activity.status === 'BOOKED' ? '🎫' : activity.status === 'COMPLETED' ? '✅' : '❌'}
                            </div>
                            <div className="activity-details">
                                <p className="activity-message">{activity.message}</p>
                                <span className="activity-time">
                                    {new Date(activity.time).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
