package com.parking.validator.controller;

import com.parking.validator.model.Booking;
import com.parking.validator.repository.BookingRepository;
import com.parking.validator.security.service.UserDetailsImpl;
import com.parking.validator.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/usage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsageReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String slotId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area) {

        LocalDateTime start;
        if (startDate != null) {
            if (startDate.contains("T")) {
                start = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_DATE_TIME);
            } else {
                start = java.time.LocalDate.parse(startDate).atStartOfDay();
            }
        } else {
            start = LocalDateTime.now().minusDays(30);
        }

        LocalDateTime end;
        if (endDate != null) {
            if (endDate.contains("T")) {
                end = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_DATE_TIME);
            } else {
                end = java.time.LocalDate.parse(endDate).atTime(23, 59, 59);
            }
        } else {
            end = LocalDateTime.now();
        }

        Map<String, String> filters = new HashMap<>();
        if (slotId != null)
            filters.put("slotId", slotId);
        if (city != null)
            filters.put("city", city);
        if (area != null)
            filters.put("area", area);

        Map<String, Object> report = reportService.generateUsageReport(start, end, filters);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("report", report);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyStats() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        Map<String, Object> stats = reportService.getPersonalStats(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String slotId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area) {

        LocalDateTime start;
        if (startDate != null) {
            if (startDate.contains("T")) {
                start = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_DATE_TIME);
            } else {
                start = java.time.LocalDate.parse(startDate).atStartOfDay();
            }
        } else {
            start = LocalDateTime.now().minusDays(30);
        }

        LocalDateTime end;
        if (endDate != null) {
            if (endDate.contains("T")) {
                end = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_DATE_TIME);
            } else {
                end = java.time.LocalDate.parse(endDate).atTime(23, 59, 59);
            }
        } else {
            end = LocalDateTime.now();
        }

        Map<String, String> filters = new HashMap<>();
        if (slotId != null)
            filters.put("slotId", slotId);
        if (city != null)
            filters.put("city", city);
        if (area != null)
            filters.put("area", area);

        // Fetch and filter bookings using the same logic as the report
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(start)
                        && !b.getCreatedAt().isAfter(end))
                .collect(java.util.stream.Collectors.toList());

        // Apply additional filters
        if (filters.get("slotId") != null) {
            String sId = filters.get("slotId");
            bookings = bookings.stream()
                    .filter(b -> b.getSlot() != null && b.getSlot().getId().equals(sId))
                    .collect(java.util.stream.Collectors.toList());
        }
        if (filters.get("city") != null) {
            String c = filters.get("city");
            bookings = bookings.stream()
                    .filter(b -> b.getSlot() != null && c.equals(b.getSlot().getCity()))
                    .collect(java.util.stream.Collectors.toList());
        }
        if (filters.get("area") != null) {
            String a = filters.get("area");
            bookings = bookings.stream()
                    .filter(b -> b.getSlot() != null && a.equals(b.getSlot().getArea()))
                    .collect(java.util.stream.Collectors.toList());
        }

        String csv = reportService.generateCSV(bookings);

        byte[] csvBytes = csv.getBytes();
        String filename = "parking_report_" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/export/my-csv")
    public ResponseEntity<byte[]> exportMyCsv() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        List<Booking> bookings = bookingRepository.findByUserOrderByCreatedAtDesc(
                com.parking.validator.model.User.builder().id(userDetails.getId()).build());

        String csv = reportService.generateCSV(bookings);
        byte[] csvBytes = csv.getBytes();
        String filename = "my_parking_history_" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
