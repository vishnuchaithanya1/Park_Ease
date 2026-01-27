import React from "react";
import SlotCard from "../components/SlotCard";
import "./SlotList.css";

const SlotList = ({ slots, onSelect }) => {
  // Show empty state if no slots
  if (!slots || slots.length === 0) {
    return (
      <div className="slot-list-container">
        <div className="empty-slot-state">
          <div className="empty-state-icon">🅿️</div>
          <h3>No Parking Slots Available</h3>
          <p>Please select a location from the filter above to view available parking slots.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slot-list-container">
      <h2 className="slot-list-title">Parking Slot Availability</h2>

      {/* Slot Grid */}
      <div className="slot-grid">
        {slots.map((slot) => (
          <SlotCard
            key={slot.id || slot._id}
            slot={slot}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default SlotList;
