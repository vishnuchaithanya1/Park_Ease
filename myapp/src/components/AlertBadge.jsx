import React from 'react';
import './AlertBadge.css';

const AlertBadge = ({ alerts, onClick }) => {
    if (!alerts || alerts.length === 0) return null;

    // Get the highest severity alert
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    const highestSeverityAlert = alerts.reduce((prev, current) => {
        return (severityOrder[current.severity] || 0) > (severityOrder[prev.severity] || 0) ? current : prev;
    });

    const getAlertIcon = (type) => {
        const icons = {
            construction: '🚧',
            maintenance: '🔧',
            closure: '🚫',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    };

    return (
        <div
            className={`alert-badge alert-badge-${highestSeverityAlert.severity}`}
            onClick={onClick}
            title="Click to view alert details"
        >
            <span className="alert-icon">{getAlertIcon(highestSeverityAlert.type)}</span>
            {alerts.length > 1 && (
                <span className="alert-count">{alerts.length}</span>
            )}
        </div>
    );
};

export default AlertBadge;
