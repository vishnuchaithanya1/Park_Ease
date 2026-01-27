import React, { useState, useEffect } from 'react';
import { getSlotAlerts, getAreaAlerts } from '../api';
import './AvailableSlotsGrid.css';

const AvailableSlotsGrid = ({ slots }) => {
    const [slotAlerts, setSlotAlerts] = useState({});

    // Fetch alerts for all slots
    useEffect(() => {
        const fetchAllAlerts = async () => {
            if (!slots || slots.length === 0) return;

            const alertsMap = {};

            for (const slot of slots) {
                try {
                    const alertPromises = [];

                    // Fetch slot-specific alerts
                    if (slot._id || slot.id) {
                        alertPromises.push(getSlotAlerts(slot._id || slot.id));
                    }

                    // Fetch area alerts
                    if (slot.area) {
                        alertPromises.push(getAreaAlerts(slot.area));
                    }

                    // Fetch city alerts
                    if (slot.city) {
                        alertPromises.push(getAreaAlerts(slot.city));
                    }

                    const results = await Promise.all(alertPromises);
                    const allAlerts = results.flat();

                    // Remove duplicates
                    const uniqueAlerts = Array.from(
                        new Map(allAlerts.map(alert => [alert._id, alert])).values()
                    );

                    if (uniqueAlerts.length > 0) {
                        alertsMap[slot._id || slot.id] = uniqueAlerts;
                    }
                } catch (error) {
                    console.error(`Error fetching alerts for slot ${slot.slotNumber}:`, error);
                }
            }

            setSlotAlerts(alertsMap);
        };

        fetchAllAlerts();
    }, [slots]);

    const getAlertSeverity = (alerts) => {
        if (!alerts || alerts.length === 0) return null;
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        const highestSeverity = alerts.reduce((prev, current) => {
            return (severityOrder[current.severity] || 0) > (severityOrder[prev.severity] || 0) ? current : prev;
        });
        return highestSeverity.severity;
    };

    return (
        <div className="available-slots-container">
            <h3 className="section-title">📊 Live Slot Availability</h3>
            <div className="status-legend">
                <div className="legend-item">
                    <span className="dot available"></span>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <span className="dot booked"></span>
                    <span>Booked</span>
                </div>
            </div>

            <div className="visual-grid">
                {slots && slots.map((slot) => {
                    const alerts = slotAlerts[slot._id || slot.id];
                    const severity = getAlertSeverity(alerts);

                    return (
                        <div
                            key={slot._id || slot.id}
                            className={`slot-dot ${slot.isAvailable ? 'available' : 'booked'} ${severity ? `has-alert-${severity}` : ''}`}
                            title={`Slot ${slot.slotNumber} - ${slot.isAvailable ? 'Available' : 'Booked'}${alerts ? ` - ${alerts.length} Alert(s)` : ''}`}
                        >
                            {slot.slotNumber}
                            {alerts && alerts.length > 0 && (
                                <span className="alert-indicator">⚠️</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="hint-text">Click markers on the map for details</p>
        </div>
    );
};

export default AvailableSlotsGrid;
