import React from "react";
import "./SlotGrid.css";

import SlotCard from "./SlotCard";

const SlotGrid = ({ slots, onSelect }) => {
  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <SlotCard
          key={slot._id}
          slot={slot}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default SlotGrid;