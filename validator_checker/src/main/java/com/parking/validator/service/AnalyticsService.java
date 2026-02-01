package com.parking.validator.service;

import com.parking.validator.model.AnalyticsResponse;
import com.parking.validator.model.Booking;
import com.parking.validator.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    public AnalyticsResponse getDashboardStats() {
        List<Booking> bookings = bookingRepository.findAll();

        AnalyticsResponse response = new AnalyticsResponse();
        response.setTotalBookings(bookings.size());
        response.setActiveBookings((int) bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.BOOKED)
                .count());
        response.setCompletedBookings((int) bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .count());

        double totalRevenue = bookings.stream()
                .filter(b -> b.getPayment() != null)
                .mapToDouble(b -> b.getPayment().getAmount())
                .sum();
        response.setTotalRevenue(totalRevenue);

        // Calculate Average Duration
        double avgDuration = bookings.stream()
                .filter(b -> b.getActualDuration() != null)
                .mapToInt(Booking::getActualDuration)
                .average()
                .orElse(0.0);
        response.setAverageDuration(avgDuration);

        // Slot Usage
        Map<String, Integer> slotUsage = new HashMap<>();
        for (Booking b : bookings) {
            String slotNum = b.getSlot() != null ? b.getSlot().getSlotNumber() : "Unknown";
            slotUsage.put(slotNum, slotUsage.getOrDefault(slotNum, 0) + 1);
        }
        response.setSlotUsage(slotUsage);

        // Section Usage
        Map<String, Integer> sectionUsage = new HashMap<>();
        for (Booking b : bookings) {
            String section = b.getSlot() != null ? b.getSlot().getSection() : "General";
            sectionUsage.put(section, sectionUsage.getOrDefault(section, 0) + 1);
        }
        response.setSectionUsage(sectionUsage);

        // Peak Hour (Simplified: based on startTime hour)
        Map<Integer, Integer> hourUsage = new HashMap<>();
        for (Booking b : bookings) {
            if (b.getStartTime() != null) {
                int hour = b.getStartTime().getHour();
                hourUsage.put(hour, hourUsage.getOrDefault(hour, 0) + 1);
            }
        }
        int peakHour = hourUsage.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(-1);
        response.setPeakHour(peakHour != -1 ? String.format("%02d:00", peakHour) : "N/A");

        return response;
    }

    public List<Map<String, Object>> getRevenueData() {
        List<Booking> bookings = bookingRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Last 7 days
        List<String> last7Days = new ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            last7Days.add(today.minusDays(i).format(formatter));
        }

        List<Map<String, Object>> revenueData = new ArrayList<>();
        for (String date : last7Days) {
            List<Booking> daysBookings = bookings.stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().format(formatter).equals(date))
                    .collect(Collectors.toList());

            double dailyRevenue = daysBookings.stream()
                    .filter(b -> b.getPayment() != null)
                    .mapToDouble(b -> b.getPayment().getAmount())
                    .sum();

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", date);
            dayMap.put("revenue", dailyRevenue);
            dayMap.put("bookings", daysBookings.size());
            revenueData.add(dayMap);
        }

        return revenueData;
    }
}
