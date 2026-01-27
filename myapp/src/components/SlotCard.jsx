import React, { useState, useEffect } from 'react';
import { getSlotAlerts, getAreaAlerts } from '../api';
import AlertBadge from './AlertBadge';
import AlertModal from './AlertModal';
import './SlotCard.css';

const SlotCard = ({ slot, onSelect }) => {
  const [alerts, setAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const isAvailable = slot.isAvailable;
  const statusClass = isAvailable ? 'available' : 'booked';
  const statusText = isAvailable ? 'AVAILABLE' : 'BOOKED';

  // Fetch alerts for this slot
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!slot._id && !slot.id) return;

      try {
        setLoadingAlerts(true);

        // Fetch alerts from multiple sources
        const alertPromises = [];

        // 1. Slot-specific alerts
        alertPromises.push(getSlotAlerts(slot._id || slot.id));

        // 2. Area-wide alerts (if slot has area)
        if (slot.area) {
          alertPromises.push(getAreaAlerts(slot.area));
        }

        // 3. City-wide alerts (if slot has city)
        if (slot.city) {
          alertPromises.push(getAreaAlerts(slot.city)); // Using getAreaAlerts for city too
        }

        // Fetch all alerts in parallel
        const results = await Promise.all(alertPromises);

        // Flatten and combine all alerts, removing duplicates by _id
        const allAlerts = results.flat();
        const uniqueAlerts = Array.from(
          new Map(allAlerts.map(alert => [alert._id, alert])).values()
        );

        setAlerts(uniqueAlerts);
      } catch (error) {
        console.error('Error fetching slot alerts:', error);
        setAlerts([]);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, [slot._id, slot.id, slot.area, slot.city]);

  const handleAlertClick = (e) => {
    e.stopPropagation(); // Prevent slot selection when clicking alert
    setShowAlertModal(true);
  };

  const handleSlotClick = () => {
    // Check if there are warning or critical alerts
    const hasWarningOrCritical = alerts.some(
      alert => alert.severity === 'warning' || alert.severity === 'critical'
    );

    if (hasWarningOrCritical) {
      setShowAlertModal(true); // Show alert instead of allowing booking
      return;
    }

    onSelect(slot);
  };

  return (
    <>
      <div
        className={`slot-card ${statusClass}`}
        onClick={handleSlotClick}
      >
        <h3>Slot {slot.slotNumber}</h3>
        <p>{statusText}</p>

        {/* Alert Badge */}
        {!loadingAlerts && alerts.length > 0 && (
          <AlertBadge alerts={alerts} onClick={handleAlertClick} />
        )}
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <AlertModal
          alerts={alerts}
          slotNumber={slot.slotNumber}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </>
  );
};

export default SlotCard;
