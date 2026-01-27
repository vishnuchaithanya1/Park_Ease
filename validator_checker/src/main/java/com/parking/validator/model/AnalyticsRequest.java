package com.parking.validator.model;

import java.util.List;

public class AnalyticsRequest {
    private List<BookingData> bookings;

    // Constructors
    public AnalyticsRequest() {
    }

    public AnalyticsRequest(List<BookingData> bookings) {
        this.bookings = bookings;
    }

    // Getters and Setters
    public List<BookingData> getBookings() {
        return bookings;
    }

    public void setBookings(List<BookingData> bookings) {
        this.bookings = bookings;
    }
}
