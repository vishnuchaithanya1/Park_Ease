import React from 'react';
import QRCode from 'react-qr-code';
import './TicketModal.css';

const TicketModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const bookingId = booking._id || booking.id;
    const ticketData = JSON.stringify({
        id: bookingId,
        vehicle: booking.vehicleNumber,
        slot: booking.slot?.slotNumber,
        startTime: booking.startTime
    });

    return (
        <div className="ticket-modal-overlay" onClick={onClose}>
            <div className="ticket-modal" onClick={e => e.stopPropagation()}>
                <div className="ticket-header">
                    <h3>🅿️ SNAP PARKING</h3>
                    <span className="ticket-type">E-TICKET</span>
                </div>

                <div className="ticket-body">
                    <div className="ticket-row main-info">
                        <div className="info-block">
                            <span className="label">SLOT</span>
                            <span className="value big">{booking.slot?.slotNumber || 'N/A'}</span>
                        </div>
                        <div className="info-block right">
                            <span className="label">VEHICLE</span>
                            <span className="value big">{booking.vehicleNumber}</span>
                        </div>
                    </div>

                    <div className="ticket-row">
                        <div className="info-block">
                            <span className="label">DATE</span>
                            <span className="value">{new Date(booking.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="info-block right">
                            <span className="label">TIME</span>
                            <span className="value">
                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="ticket-row">
                        <div className="info-block">
                            <span className="label">LOCATION</span>
                            <span className="value location">{booking.slot?.address || 'Smart Parking Complex'}</span>
                        </div>
                    </div>

                    <div className="ticket-divider">
                        <div className="notch-left"></div>
                        <div className="dashed-line"></div>
                        <div className="notch-right"></div>
                    </div>

                    <div className="qrcode-section">
                        <QRCode
                            value={ticketData}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#1e293b"
                            level="H"
                        />
                        <p className="ticket-id">ID: {bookingId.slice(-8).toUpperCase()}</p>
                        <span className="scan-hint">Scan at entry gate</span>
                    </div>
                </div>

                <div className="ticket-footer">
                    <button className="download-btn" onClick={() => window.print()}>
                        ⬇️ Download
                    </button>
                    <button className="close-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;
