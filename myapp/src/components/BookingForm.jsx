import React, { useState, useEffect } from 'react';
import { createBooking } from '../api';
import PaymentSummary from './PaymentSummary';
import './BookingForm.css';

const BookingForm = ({ slots, selectedSlot: propSelectedSlot, onBookingSuccess }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null); // For payment flow
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (propSelectedSlot) {
      setSelectedSlotId(propSelectedSlot._id || propSelectedSlot.id);
    }
  }, [propSelectedSlot]);

  const checkAvailability = () => {
    if (!selectedSlotId) {
      setMessage("Please select a slot first");
      setIsError(true);
      setIsAvailable(false);
      return;
    }

    const slot = slots.find((s) => (s._id || s.id) === selectedSlotId);

    if (!slot) {
      setMessage("Slot not found");
      setIsError(true);
      setIsAvailable(false);
      return;
    }

    if (!slot.isAvailable) {
      setMessage("Slot already booked");
      setIsError(true);
      setIsAvailable(false);
    } else {
      setMessage(`Slot ${slot.slotNumber} is available`);
      setIsError(false);
      setIsAvailable(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAvailable) {
      setMessage("Please check availability first");
      setIsError(true);
      return;
    }

    if (!vehicleNumber || !startTime || !endTime) {
      setMessage("Complete all fields to proceed");
      setIsError(true);
      return;
    }

    if (startTime >= endTime) {
      setMessage("End time must be after start time");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // datetime-local already provides full ISO datetime string
      const bookingData = {
        slotId: selectedSlotId,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      };

      const response = await createBooking(bookingData);

      // Store booking data and show payment summary
      setCreatedBooking({
        _id: response.booking?._id || 'temp-id',
        ...bookingData,
        slotNumber: slots.find(s => (s._id || s.id) === selectedSlotId)?.slotNumber || 'Unknown'
      });
      setShowPayment(true);
      setMessage(`Booking created! Proceeding to payment...`);
      setIsError(false);

    } catch (err) {
      setMessage(err.message || 'Booking failed. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (paymentData) => {
    // Payment successful
    setMessage(`Payment successful! Booking confirmed.`);
    setIsError(false);

    // Reset form and hide payment
    setVehicleNumber('');
    setStartTime('');
    setEndTime('');
    setSelectedSlotId('');
    setIsAvailable(false);
    setShowPayment(false);
    setCreatedBooking(null);

    // Notify parent to refresh slots
    if (onBookingSuccess) {
      onBookingSuccess();
    }
  };

  const handlePaymentCancel = () => {
    // User cancelled payment
    setShowPayment(false);
    setCreatedBooking(null);
    setMessage('Payment cancelled. You can try again.');
    setIsError(true);
  };

  // If showing payment summary, render that instead
  if (showPayment && createdBooking) {
    return (
      <PaymentSummary
        booking={createdBooking}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <div className="premium-booking-container">
      <div className="premium-booking-card">
        <h3 className="booking-title">Book Slot</h3>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="slot-check-row">
            <select
              value={selectedSlotId}
              onChange={(e) => {
                setSelectedSlotId(e.target.value);
                setIsAvailable(false);
                setMessage("");
              }}
              className="p-input slot-select"
            >
              <option value="">Select Slot</option>
              {slots && slots.map((slot) => (
                <option key={slot._id || slot.id} value={slot._id || slot.id}>
                  Slot {slot.slotNumber || slot.id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={checkAvailability}
              className="check-availability-btn"
            >
              Check Availability
            </button>
          </div>

          <div className="p-input-wrapper">
            <label>Vehicle Number</label>
            <input
              type="text"
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="p-input"
            />
          </div>

          <div className="p-time-grid">
            <div className="p-input-wrapper">
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="p-input"
              />
            </div>
            <div className="p-input-wrapper">
              <label>End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="p-input"
              />
            </div>
          </div>

          <button type="submit" className="premium-submit-btn" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>

        {message && (
          <div className={`p-message-banner ${isError ? 'error' : 'success'}`}>
            {isError ? '⚠️' : '✅'} {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;