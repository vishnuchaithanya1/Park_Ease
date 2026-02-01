package com.parking.validator.controller;

import com.parking.validator.dto.BookingResponse;
import com.parking.validator.dto.CreateBookingRequest;
import com.parking.validator.model.Booking;
import com.parking.validator.model.Slot;
import com.parking.validator.model.User;
import com.parking.validator.repository.UserRepository;
import com.parking.validator.security.service.UserDetailsImpl;
import com.parking.validator.service.BookingService;
import com.parking.validator.service.FeeCalculationService;
import com.parking.validator.service.ParkingTimerService;
import com.parking.validator.service.SlotService;
import com.parking.validator.service.WebSocketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @Autowired
    private SlotService slotService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebSocketService webSocketService;

    @PostMapping("/create")
    @SuppressWarnings("null")
    public ResponseEntity<?> createBooking(@Valid @RequestBody @NonNull CreateBookingRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        String userId = userDetails.getId();
        if (userId == null) {
            return ResponseEntity.status(401).body("User ID not found");
        }
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }
        User user = userOptional.get();

        String slotId = request.getSlotId();
        if (slotId == null) {
            return ResponseEntity.status(400).body("Slot ID is required");
        }
        Optional<Slot> slotOptional = slotService.getSlotById(slotId);
        if (slotOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Slot not found");
            return ResponseEntity.status(404).body(error);
        }

        Slot slot = slotOptional.get();
        String vehicleNumber = request.getVehicleNumber();
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();

        if (vehicleNumber == null || startTime == null || endTime == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Vehicle number, start time, and end time are required");
            return ResponseEntity.status(400).body(error);
        }

        Booking booking = bookingService.createBooking(user, slot, vehicleNumber, startTime, endTime);

        if (booking == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create booking");
            return ResponseEntity.status(500).body(error);
        }

        // Emit real-time notification
        webSocketService.emitBookingCreated(booking);

        return ResponseEntity.status(201).body(BookingResponse.builder()
                .message("Booking successful!")
                .booking(booking)
                .slot(slot)
                .build());
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        String userId = userDetails.getId();
        if (userId == null) {
            return ResponseEntity.status(401).body("User ID not found");
        }
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }
        User user = userOptional.get();
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        // Simple role check (in a real app, use @PreAuthorize)
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @Autowired
    private ParkingTimerService parkingTimerService;

    @Autowired
    private FeeCalculationService feeCalculationService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingDetails(@PathVariable @NonNull String id) {
        Optional<Booking> bookingOptional = bookingService.getBookingById(id);
        if (bookingOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking not found");
            return ResponseEntity.status(404).body(error);
        }
        return ResponseEntity.ok(bookingOptional.get());
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<?> checkIn(@PathVariable @NonNull String id) {
        Optional<Booking> bookingOptional = bookingService.getBookingById(id);
        if (bookingOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking not found");
            return ResponseEntity.status(404).body(error);
        }

        Booking booking = bookingOptional.get();
        booking.setActualEntryTime(java.time.LocalDateTime.now());
        booking.setParkingStatus(Booking.ParkingStatus.CHECKED_IN);
        bookingService.saveBooking(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Check-in successful");
        response.put("booking", booking);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/check-out")
    @SuppressWarnings("null")
    public ResponseEntity<?> checkOut(@PathVariable @NonNull String id) {
        Optional<Booking> bookingOptional = bookingService.getBookingById(id);
        if (bookingOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking not found");
            return ResponseEntity.status(404).body(error);
        }

        Booking booking = bookingOptional.get();
        if (booking.getParkingStatus() != Booking.ParkingStatus.CHECKED_IN) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking must be checked in first");
            return ResponseEntity.status(400).body(error);
        }

        LocalDateTime exitTime = LocalDateTime.now();
        booking.setActualExitTime(exitTime);

        long durationMinutes = parkingTimerService.calculateDuration(booking.getActualEntryTime(), exitTime);
        booking.setActualDuration((int) durationMinutes);

        FeeCalculationService.FeeDetails feeDetails = feeCalculationService.calculateFee(durationMinutes);

        if (booking.getPayment() == null) {
            booking.setPayment(new Booking.PaymentInfo());
        }
        booking.getPayment().setAmount(feeDetails.getFee());
        booking.getPayment().setStatus(Booking.PaymentStatus.pending);

        booking.setParkingStatus(Booking.ParkingStatus.CHECKED_OUT);
        bookingService.saveBooking(booking);

        // Make slot available again
        Slot slot = booking.getSlot();
        if (slot != null && slot.getId() != null) {
            slot.setAvailable(true);
            slotService.updateSlotAvailability(slot.getId(), true);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Check-out successful");
        response.put("booking", booking);
        response.put("feeDetails", feeDetails);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/process-payment")
    public ResponseEntity<?> processPayment(@PathVariable @NonNull String id, @RequestBody Map<String, String> body) {
        Optional<Booking> bookingOptional = bookingService.getBookingById(id);
        if (bookingOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking not found");
            return ResponseEntity.status(404).body(error);
        }

        Booking booking = bookingOptional.get();
        if (booking.getParkingStatus() != Booking.ParkingStatus.CHECKED_OUT) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking must be checked out first");
            return ResponseEntity.status(400).body(error);
        }

        String method = body.getOrDefault("method", "upi");
        booking.getPayment().setMethod(Booking.PaymentMethod.valueOf(method));
        booking.getPayment().setStatus(Booking.PaymentStatus.completed);
        booking.getPayment().setTransactionId("TXN-" + System.currentTimeMillis());
        booking.getPayment().setPaidAt(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.COMPLETED);

        bookingService.saveBooking(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment successful");
        response.put("success", true);
        response.put("payment", booking.getPayment());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/fee-details")
    public ResponseEntity<?> getFeeDetails(@PathVariable @NonNull String id) {
        Optional<Booking> bookingOptional = bookingService.getBookingById(id);
        if (bookingOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking not found");
            return ResponseEntity.status(404).body(error);
        }

        Booking booking = bookingOptional.get();
        LocalDateTime entryTime = booking.getActualEntryTime() != null ? booking.getActualEntryTime()
                : booking.getStartTime();
        LocalDateTime exitTime = booking.getActualExitTime() != null ? booking.getActualExitTime()
                : LocalDateTime.now();

        long durationMinutes = parkingTimerService.calculateDuration(entryTime, exitTime);
        FeeCalculationService.FeeDetails feeDetails = feeCalculationService.calculateFee(durationMinutes);

        Map<String, Object> response = new HashMap<>();

        // Match frontend expectations in FeeDetails.jsx
        Map<String, Object> bookingInfo = new HashMap<>();
        bookingInfo.put("slotNumber", booking.getSlot() != null ? booking.getSlot().getSlotNumber() : "N/A");
        bookingInfo.put("vehicleNumber", booking.getVehicleNumber());
        bookingInfo.put("actualEntryTime", entryTime);
        bookingInfo.put("actualExitTime", exitTime);

        Map<String, Object> durationMap = new HashMap<>();
        long hours = durationMinutes / 60;
        long mins = durationMinutes % 60;
        durationMap.put("formatted", String.format("%dh %dm", hours, mins));
        durationMap.put("totalMinutes", durationMinutes);

        Map<String, Object> feeMap = new HashMap<>();
        feeMap.put("amount", feeDetails.getFee());
        feeMap.put("actualDuration", durationMinutes + " mins");
        feeMap.put("roundedDuration", feeDetails.getRoundedDuration() + " mins");
        feeMap.put("breakdown", feeCalculationService.getFeeBreakdown(durationMinutes));

        Map<String, Object> pricingMap = new HashMap<>();
        pricingMap.put("description", "Base Fee: ₹20 + ₹5 per 15 mins");

        response.put("booking", bookingInfo);
        response.put("duration", durationMap);
        response.put("fee", feeMap);
        response.put("pricing", pricingMap);
        response.put("payment", booking.getPayment());

        return ResponseEntity.ok(response);
    }
}
