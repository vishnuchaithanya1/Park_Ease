package com.parking.validator.service;

import com.parking.validator.model.Booking;
import com.parking.validator.model.User;
import com.parking.validator.repository.BookingRepository;
import com.parking.validator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(@org.springframework.lang.NonNull String id) {
        return userRepository.findById(id);
    }

    public Map<String, Object> getUserDetails(@org.springframework.lang.NonNull String userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty())
            return null;

        User user = userOptional.get();
        List<Booking> bookings = bookingRepository.findByUserOrderByCreatedAtDesc(user);

        long totalBookings = bookings.size();
        long activeBookings = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.BOOKED).count();
        long completedBookings = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .count();

        double totalSpent = bookings.stream()
                .filter(b -> b.getPayment() != null)
                .mapToDouble(b -> b.getPayment().getAmount())
                .sum();

        Map<String, Object> details = new HashMap<>();
        details.put("user", user);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("activeBookings", activeBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("totalSpent", totalSpent);
        details.put("statistics", stats);

        // Transform bookings for frontend UserDetailModal
        List<Map<String, Object>> transformedBookings = bookings.stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", b.getId());
            m.put("slotNumber", b.getSlot() != null ? b.getSlot().getSlotNumber() : "N/A");
            m.put("location", b.getSlot() != null ? b.getSlot().getAddress() : "N/A");
            m.put("city", b.getSlot() != null ? b.getSlot().getCity() : "N/A");
            m.put("vehicleNumber", b.getVehicleNumber());
            m.put("startTime", b.getStartTime());
            m.put("actualDuration", b.getActualDuration());
            m.put("paymentAmount", b.getPayment() != null ? b.getPayment().getAmount() : 0.0);
            m.put("status", b.getStatus().toString());
            return m;
        }).collect(java.util.stream.Collectors.toList());

        details.put("bookings", transformedBookings);

        return details;
    }
}
