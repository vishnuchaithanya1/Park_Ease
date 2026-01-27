package com.parking.validator.service;

import com.parking.validator.model.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final double HOURLY_RATE = 20.0; // ₹20 per hour

    /**
     * Calculate comprehensive analytics from booking data
     */
    public AnalyticsResponse calculateAnalytics(List<BookingData> bookings) {
        AnalyticsResponse response = new AnalyticsResponse();

        if (bookings == null || bookings.isEmpty()) {
            return response;
        }

        // Total bookings
        response.setTotalBookings(bookings.size());

        // Active vs Completed bookings
        long activeCount = bookings.stream()
                .filter(b -> "BOOKED".equals(b.getStatus()))
                .count();
        long completedCount = bookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .count();

        response.setActiveBookings((int) activeCount);
        response.setCompletedBookings((int) completedCount);

        // Calculate total revenue
        double totalRevenue = bookings.stream()
                .mapToDouble(this::calculateBookingRevenue)
                .sum();
        response.setTotalRevenue(Math.round(totalRevenue * 100.0) / 100.0);

        // Calculate average duration in hours
        double avgDuration = bookings.stream()
                .mapToDouble(this::calculateDurationHours)
                .average()
                .orElse(0.0);
        response.setAverageDuration(Math.round(avgDuration * 100.0) / 100.0);

        // Find peak hour
        String peakHour = findPeakHour(bookings);
        response.setPeakHour(peakHour);

        // Slot usage statistics
        Map<String, Integer> slotUsage = bookings.stream()
                .collect(Collectors.groupingBy(
                        BookingData::getSlotNumber,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        response.setSlotUsage(slotUsage);

        // Section usage statistics
        Map<String, Integer> sectionUsage = bookings.stream()
                .filter(b -> b.getSection() != null)
                .collect(Collectors.groupingBy(
                        BookingData::getSection,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        response.setSectionUsage(sectionUsage);

        return response;
    }

    /**
     * Calculate payment amount for a booking duration
     */
    public PaymentResponse calculatePayment(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (startTime.isAfter(endTime) || startTime.isEqual(endTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        double durationHours = calculateDurationHours(startTime, endTime);
        double amount = durationHours * HOURLY_RATE;

        // Round to 2 decimal places
        amount = Math.round(amount * 100.0) / 100.0;
        durationHours = Math.round(durationHours * 100.0) / 100.0;

        String breakdown = String.format("%.2f hours × ₹%.2f/hour = ₹%.2f",
                durationHours, HOURLY_RATE, amount);

        return new PaymentResponse(amount, durationHours, breakdown);
    }

    /**
     * Calculate revenue for a single booking
     */
    private double calculateBookingRevenue(BookingData booking) {
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            return 0.0;
        }
        double hours = calculateDurationHours(booking);
        return hours * HOURLY_RATE;
    }

    /**
     * Calculate duration in hours for a booking
     */
    private double calculateDurationHours(BookingData booking) {
        return calculateDurationHours(booking.getStartTime(), booking.getEndTime());
    }

    /**
     * Calculate duration in hours between two times
     */
    private double calculateDurationHours(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return 0.0;
        }
        Duration duration = Duration.between(start, end);
        return duration.toMinutes() / 60.0;
    }

    /**
     * Find the peak hour when most bookings start
     */
    private String findPeakHour(List<BookingData> bookings) {
        Map<Integer, Long> hourCounts = bookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getStartTime().getHour(),
                        Collectors.counting()));

        if (hourCounts.isEmpty()) {
            return "N/A";
        }

        int peakHour = hourCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(0);

        return String.format("%02d:00 - %02d:00", peakHour, peakHour + 1);
    }
}
