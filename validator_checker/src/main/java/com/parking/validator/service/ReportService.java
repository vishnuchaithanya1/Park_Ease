package com.parking.validator.service;

import com.parking.validator.model.Booking;
import com.parking.validator.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

        @Autowired
        private BookingRepository bookingRepository;

        public Map<String, Object> generateUsageReport(LocalDateTime start, LocalDateTime end,
                        Map<String, String> filters) {
                List<Booking> bookings = bookingRepository.findAll().stream()
                                .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(start)
                                                && !b.getCreatedAt().isAfter(end))
                                .collect(Collectors.toList());

                // Apply filters
                if (filters.get("slotId") != null) {
                        String slotId = filters.get("slotId");
                        bookings = bookings.stream()
                                        .filter(b -> b.getSlot() != null && b.getSlot().getId().equals(slotId))
                                        .collect(Collectors.toList());
                }
                if (filters.get("city") != null) {
                        String city = filters.get("city");
                        bookings = bookings.stream()
                                        .filter(b -> b.getSlot() != null && city.equals(b.getSlot().getCity()))
                                        .collect(Collectors.toList());
                }
                if (filters.get("area") != null) {
                        String area = filters.get("area");
                        bookings = bookings.stream()
                                        .filter(b -> b.getSlot() != null && area.equals(b.getSlot().getArea()))
                                        .collect(Collectors.toList());
                }

                Map<String, Object> report = new HashMap<>();
                Map<String, Object> summary = new HashMap<>();
                summary.put("totalBookings", bookings.size());
                summary.put("activeBookings",
                                bookings.stream().filter(b -> b.getParkingStatus() == Booking.ParkingStatus.CHECKED_IN)
                                                .count());
                summary.put("completedBookings",
                                bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                                                .count());
                summary.put("totalRevenue", bookings.stream()
                                .filter(b -> b.getPayment() != null
                                                && b.getPayment().getStatus() == Booking.PaymentStatus.completed)
                                .mapToDouble(b -> b.getPayment().getAmount() != null ? b.getPayment().getAmount() : 0.0)
                                .sum());

                double avgDuration = bookings.stream()
                                .filter(b -> b.getActualDuration() != null && b.getActualDuration() > 0)
                                .mapToInt(b -> b.getActualDuration())
                                .average().orElse(0.0);
                summary.put("averageDuration", Math.round(avgDuration));

                report.put("summary", summary);
                report.put("peakHours", calculatePeakHours(bookings));
                report.put("segmentation", calculateSegmentation(bookings));
                report.put("timeSeries", calculateTimeSeries(bookings, start, end));

                return report;
        }

        private List<Map<String, Object>> calculateTimeSeries(List<Booking> bookings, LocalDateTime start,
                        LocalDateTime end) {
                List<Map<String, Object>> timeSeries = new ArrayList<>();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

                // Generate points for each day in range (limit to reasonable number)
                LocalDateTime current = start;
                while (!current.isAfter(end) && !current.isAfter(LocalDateTime.now())) {
                        LocalDateTime dayStart = current.withHour(0).withMinute(0).withSecond(0);
                        LocalDateTime dayEnd = current.withHour(23).withMinute(59).withSecond(59);
                        String dateLabel = current.format(formatter);

                        long count = bookings.stream()
                                        .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(dayStart)
                                                        && !b.getCreatedAt().isAfter(dayEnd))
                                        .count();

                        double revenue = bookings.stream()
                                        .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(dayStart)
                                                        && !b.getCreatedAt().isAfter(dayEnd))
                                        .filter(b -> b.getPayment() != null && b.getPayment()
                                                        .getStatus() == Booking.PaymentStatus.completed)
                                        .mapToDouble(b -> b.getPayment().getAmount() != null
                                                        ? b.getPayment().getAmount()
                                                        : 0.0)
                                        .sum();

                        Map<String, Object> dataPoint = new HashMap<>();
                        dataPoint.put("date", dateLabel);
                        dataPoint.put("bookings", count);
                        dataPoint.put("revenue", revenue);
                        timeSeries.add(dataPoint);

                        current = current.plusDays(1);
                        if (timeSeries.size() > 60)
                                break; // Safety limit
                }
                return timeSeries;
        }

        private Map<String, Object> calculatePeakHours(List<Booking> bookings) {
                Map<Integer, Integer> hourCounts = new HashMap<>();
                for (Booking b : bookings) {
                        if (b.getStartTime() != null) {
                                int hour = b.getStartTime().getHour();
                                hourCounts.put(hour, hourCounts.getOrDefault(hour, 0) + 1);
                        }
                }

                List<Map<String, Object>> distribution = hourCounts.entrySet().stream()
                                .map(e -> {
                                        Map<String, Object> m = new HashMap<>();
                                        m.put("hour", e.getKey());
                                        m.put("count", e.getValue());
                                        m.put("timeLabel", String.format("%02d:00 - %02d:59", e.getKey(), e.getKey()));
                                        return m;
                                })
                                .sorted((m1, m2) -> (Integer) m2.get("count") - (Integer) m1.get("count"))
                                .collect(Collectors.toList());

                Map<String, Object> peakHours = new HashMap<>();
                peakHours.put("distribution", distribution);
                peakHours.put("peakHour", distribution.isEmpty() ? "N/A" : distribution.get(0).get("timeLabel"));
                return peakHours;
        }

        private Map<String, Object> calculateSegmentation(List<Booking> bookings) {
                Map<String, Object> segmentation = new HashMap<>();

                // By Status
                Map<String, Long> byStatus = bookings.stream()
                                .collect(Collectors.groupingBy(b -> b.getStatus().toString(), Collectors.counting()));
                segmentation.put("byStatus", byStatus);

                // By Slot (List for Recharts)
                List<Map<String, Object>> bySlot = bookings.stream()
                                .filter(b -> b.getSlot() != null)
                                .collect(Collectors.groupingBy(b -> b.getSlot().getSlotNumber(), Collectors.counting()))
                                .entrySet().stream()
                                .map(e -> {
                                        Map<String, Object> m = new HashMap<>();
                                        m.put("slotNumber", e.getKey());
                                        m.put("count", e.getValue());
                                        // Calculate revenue for this slot
                                        double rev = bookings.stream()
                                                        .filter(b -> b.getSlot() != null && e.getKey()
                                                                        .equals(b.getSlot().getSlotNumber()))
                                                        .filter(b -> b.getPayment() != null && b.getPayment()
                                                                        .getStatus() == Booking.PaymentStatus.completed)
                                                        .mapToDouble(b -> b.getPayment().getAmount() != null
                                                                        ? b.getPayment().getAmount()
                                                                        : 0.0)
                                                        .sum();
                                        m.put("revenue", rev);
                                        return m;
                                })
                                .sorted((m1, m2) -> (int) ((long) m2.get("count") - (long) m1.get("count")))
                                .collect(Collectors.toList());
                segmentation.put("bySlot", bySlot);

                // By Location
                List<Map<String, Object>> byLocation = bookings.stream()
                                .filter(b -> b.getSlot() != null && b.getSlot().getAddress() != null)
                                .collect(Collectors.groupingBy(b -> b.getSlot().getAddress(), Collectors.counting()))
                                .entrySet().stream()
                                .map(e -> {
                                        Map<String, Object> m = new HashMap<>();
                                        m.put("address", e.getKey());
                                        m.put("count", e.getValue());
                                        return m;
                                })
                                .sorted((m1, m2) -> (int) ((long) m2.get("count") - (long) m1.get("count")))
                                .collect(Collectors.toList());
                segmentation.put("byLocation", byLocation);

                return segmentation;
        }

        public Map<String, Object> getPersonalStats(String userId) {
                List<Booking> bookings = bookingRepository
                                .findByUserOrderByCreatedAtDesc(
                                                com.parking.validator.model.User.builder().id(userId).build());

                Map<String, Object> stats = new HashMap<>();
                Map<String, Object> summary = new HashMap<>();

                long completedCount = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                                .count();
                double totalSpent = bookings.stream()
                                .filter(b -> b.getPayment() != null
                                                && b.getPayment().getStatus() == Booking.PaymentStatus.completed)
                                .mapToDouble(b -> b.getPayment().getAmount() != null ? b.getPayment().getAmount() : 0.0)
                                .sum();
                long activeCount = bookings.stream()
                                .filter(b -> b.getParkingStatus() == Booking.ParkingStatus.CHECKED_IN)
                                .count();
                double avgDuration = bookings.stream()
                                .filter(b -> b.getActualDuration() != null && b.getActualDuration() > 0)
                                .mapToInt(b -> b.getActualDuration())
                                .average().orElse(0.0);

                // Favorite Location
                String favorite = bookings.stream()
                                .filter(b -> b.getSlot() != null && b.getSlot().getArea() != null)
                                .collect(Collectors.groupingBy(b -> b.getSlot().getArea(), Collectors.counting()))
                                .entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey)
                                .orElse("N/A");

                summary.put("totalBookings", bookings.size());
                summary.put("totalSpent", Math.round(totalSpent * 100.0) / 100.0);
                summary.put("activeBookings", activeCount);
                summary.put("completedBookings", completedCount);
                summary.put("averageDuration", Math.round(avgDuration));
                summary.put("favoriteLocation", favorite);

                stats.put("summary", summary);

                // Recent Bookings (Transformed)
                List<Map<String, Object>> recent = bookings.stream().limit(10).map(b -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", b.getId());
                        m.put("slotNumber", b.getSlot() != null ? b.getSlot().getSlotNumber() : "N/A");
                        m.put("date", b.getCreatedAt());
                        m.put("amount", b.getPayment() != null ? b.getPayment().getAmount() : 0.0);
                        m.put("status", b.getStatus().toString());
                        return m;
                }).collect(Collectors.toList());
                stats.put("recentBookings", recent);

                // Time Series (Last 7 days for trend)
                List<Map<String, Object>> trend = new ArrayList<>();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
                for (int i = 6; i >= 0; i--) {
                        LocalDateTime day = LocalDateTime.now().minusDays(i).withHour(0).withMinute(0);
                        String dateLabel = day.format(formatter);

                        long count = bookings.stream()
                                        .filter(b -> b.getCreatedAt() != null &&
                                                        b.getCreatedAt().getYear() == day.getYear() &&
                                                        b.getCreatedAt().getDayOfYear() == day.getDayOfYear())
                                        .count();

                        double revenue = bookings.stream()
                                        .filter(b -> b.getCreatedAt() != null &&
                                                        b.getCreatedAt().getYear() == day.getYear() &&
                                                        b.getCreatedAt().getDayOfYear() == day.getDayOfYear())
                                        .filter(b -> b.getPayment() != null && b.getPayment()
                                                        .getStatus() == Booking.PaymentStatus.completed)
                                        .mapToDouble(b -> b.getPayment().getAmount() != null
                                                        ? b.getPayment().getAmount()
                                                        : 0.0)
                                        .sum();

                        Map<String, Object> dataPoint = new HashMap<>();
                        dataPoint.put("date", dateLabel);
                        dataPoint.put("bookings", count);
                        dataPoint.put("revenue", revenue);
                        trend.add(dataPoint);
                }
                stats.put("timeSeries", trend);

                // Peak Hours (Personal)
                Map<String, Object> personalPeak = calculatePeakHours(bookings);
                stats.put("peakHours", personalPeak.get("distribution"));

                return stats;
        }

        public String generateCSV(List<Booking> bookings) {
                StringBuilder csv = new StringBuilder();
                csv.append("Booking ID,Date,User Name,Slot Number,Vehicle Number,Start Time,End Time,Amount,Status\n");

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

                for (Booking b : bookings) {
                        csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%.2f,%s\n",
                                        b.getId(),
                                        b.getCreatedAt() != null ? b.getCreatedAt().format(formatter) : "N/A",
                                        b.getUser() != null ? b.getUser().getName() : "N/A",
                                        b.getSlot() != null ? b.getSlot().getSlotNumber() : "N/A",
                                        b.getVehicleNumber(),
                                        b.getStartTime() != null ? b.getStartTime().format(formatter) : "N/A",
                                        b.getEndTime() != null ? b.getEndTime().format(formatter) : "N/A",
                                        b.getPayment() != null ? b.getPayment().getAmount() : 0.0,
                                        b.getStatus()));
                }
                return csv.toString();
        }
}
