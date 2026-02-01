package com.parking.validator.controller;

import com.parking.validator.model.AnalyticsResponse;
import com.parking.validator.model.Booking;
import com.parking.validator.repository.BookingRepository;
import com.parking.validator.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        AnalyticsResponse stats = analyticsService.getDashboardStats();
        List<Map<String, Object>> revenueData = analyticsService.getRevenueData();

        Map<String, Object> response = new HashMap<>();
        response.put("totalBookings", stats.getTotalBookings());
        response.put("activeBookings", stats.getActiveBookings());
        response.put("completedBookings", stats.getCompletedBookings());
        response.put("totalRevenue", stats.getTotalRevenue());
        response.put("averageDuration", stats.getAverageDuration());
        response.put("peakHour", stats.getPeakHour());
        response.put("slotUsage", stats.getSlotUsage());
        response.put("sectionUsage", stats.getSectionUsage());
        response.put("revenueData", revenueData);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentActivity() {
        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .limit(10)
                .collect(Collectors.toList());

        List<Map<String, Object>> activity = recentBookings.stream().map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("type", "booking");
            map.put("message", String.format("User %s booked Slot %s",
                    b.getUser() != null ? b.getUser().getName() : "Unknown",
                    b.getSlot() != null ? b.getSlot().getSlotNumber() : "Unknown"));
            map.put("time", b.getCreatedAt());
            map.put("status", b.getStatus());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(activity);
    }
}
