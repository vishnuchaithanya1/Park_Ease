import React, { useState, useEffect } from 'react';
import './LiveParkingTimer.css';

const LiveParkingTimer = ({ actualEntryTime }) => {
    const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!actualEntryTime) return;

        const calculateElapsedTime = () => {
            const entryTime = new Date(actualEntryTime);
            const now = new Date();
            const diffMs = now - entryTime;

            // Convert to hours, minutes, seconds
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setElapsedTime({ hours, minutes, seconds });
        };

        // Calculate immediately
        calculateElapsedTime();

        // Update every second
        const interval = setInterval(calculateElapsedTime, 1000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, [actualEntryTime]);

    const formatTime = (value) => {
        return value.toString().padStart(2, '0');
    };

    return (
        <div className="live-parking-timer">
            <div className="timer-label">
                <span className="pulse-dot"></span>
                <span>Active Parking Time</span>
            </div>
            <div className="timer-display">
                <div className="time-segment">
                    <span className="time-value">{formatTime(elapsedTime.hours)}</span>
                    <span className="time-unit">hrs</span>
                </div>
                <span className="time-separator">:</span>
                <div className="time-segment">
                    <span className="time-value">{formatTime(elapsedTime.minutes)}</span>
                    <span className="time-unit">min</span>
                </div>
                <span className="time-separator">:</span>
                <div className="time-segment">
                    <span className="time-value">{formatTime(elapsedTime.seconds)}</span>
                    <span className="time-unit">sec</span>
                </div>
            </div>
        </div>
    );
};

export default LiveParkingTimer;
