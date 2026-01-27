import React from 'react';
import './DateRangePicker.css';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, onQuickSelect }) => {
    const handleQuickSelect = (days) => {
        const end = new Date();
        const start = new Date();

        if (days === 'all') {
            // All Time - set start date to very far in the past
            start.setFullYear(2020, 0, 1); // January 1, 2020
            start.setHours(0, 0, 0, 0);
        } else if (days === 0) {
            // Today
            start.setHours(0, 0, 0, 0);
        } else if (days === 'month') {
            // This month
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
        } else {
            // Last N days
            start.setDate(start.getDate() - days);
            start.setHours(0, 0, 0, 0);
        }

        onQuickSelect(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    };

    return (
        <div className="date-range-picker">
            <div className="quick-select-buttons">
                <button onClick={() => handleQuickSelect(0)} className="quick-btn">
                    Today
                </button>
                <button onClick={() => handleQuickSelect(7)} className="quick-btn">
                    Last 7 Days
                </button>
                <button onClick={() => handleQuickSelect(30)} className="quick-btn">
                    Last 30 Days
                </button>
                <button onClick={() => handleQuickSelect('month')} className="quick-btn">
                    This Month
                </button>
                <button onClick={() => handleQuickSelect('all')} className="quick-btn all-time-btn">
                    📅 All Time
                </button>
            </div>

            <div className="custom-date-range">
                <div className="date-input-group">
                    <label>From:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        max={endDate}
                    />
                </div>
                <div className="date-input-group">
                    <label>To:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        min={startDate}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;
