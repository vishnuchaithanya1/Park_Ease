package com.parking.validator.service;

import com.parking.validator.model.Booking;
import com.parking.validator.model.Slot;
import com.parking.validator.model.User;
import com.parking.validator.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotService slotService;

    public Booking createBooking(@org.springframework.lang.NonNull User user,
            @org.springframework.lang.NonNull Slot slot,
            @org.springframework.lang.NonNull String vehicleNumber,
            @org.springframework.lang.NonNull LocalDateTime startTime,
            @org.springframework.lang.NonNull LocalDateTime endTime) {
        Booking booking = Booking.builder()
                .user(user)
                .slot(slot)
                .vehicleNumber(vehicleNumber)
                .startTime(startTime)
                .endTime(endTime)
                .parkingStatus(Booking.ParkingStatus.SCHEDULED)
                .status(Booking.BookingStatus.BOOKED)
                .createdAt(LocalDateTime.now())
                .payment(new Booking.PaymentInfo())
                .build();

        // Update slot availability and emit WebSocket event
        slotService.updateSlotAvailability(java.util.Objects.requireNonNull(slot.getId()), false);

        @SuppressWarnings("null")
        Booking saved = bookingRepository.save(booking);
        return saved;
    }

    public List<Booking> getMyBookings(User user) {
        return bookingRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(@org.springframework.lang.NonNull String id) {
        return bookingRepository.findById(id);
    }

    public Booking saveBooking(@org.springframework.lang.NonNull Booking booking) {
        return bookingRepository.save(booking);
    }
}
