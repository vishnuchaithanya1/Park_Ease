import React from 'react';
import './AlertModal.css';

const AlertModal = ({ alerts, slotNumber, onClose }) => {
    if (!alerts || alerts.length === 0) return null;

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

    const formatDate = (dateString) => {
        if (!dateString) return 'No expiration';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="alert-modal-overlay" onClick={onClose}>
            <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
                <div className="alert-modal-header">
                    <h2>🚨 Alerts for Slot {slotNumber}</h2>
                    <button onClick={onClose} className="alert-modal-close">✕</button>
                </div>

                <div className="alert-modal-content">
                    {alerts.map((alert, index) => (
                        <div key={alert._id || index} className={`alert-item alert-item-${alert.severity}`}>
                            <div className="alert-item-header">
                                <span className="alert-item-icon">{getAlertIcon(alert.type)}</span>
                                <span className="alert-item-type">{alert.type}</span>
                                <span className={`alert-item-severity severity-${alert.severity}`}>
                                    {alert.severity}
                                </span>
                            </div>

                            <div className="alert-item-message">
                                {alert.message}
                            </div>

                            <div className="alert-item-footer">
                                <span className="alert-item-date">
                                    📅 Created: {formatDate(alert.createdAt)}
                                </span>
                                {alert.expiresAt && (
                                    <span className="alert-item-expires">
                                        ⏰ Expires: {formatDate(alert.expiresAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="alert-modal-footer">
                    <button onClick={onClose} className="alert-modal-btn">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
