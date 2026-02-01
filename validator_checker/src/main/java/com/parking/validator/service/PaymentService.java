package com.parking.validator.service;

import com.parking.validator.model.Booking;
import com.parking.validator.model.Payment;
import com.parking.validator.model.User;
import com.parking.validator.repository.BookingRepository;
import com.parking.validator.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @org.springframework.lang.Nullable
    public Payment processPayment(@org.springframework.lang.NonNull String bookingId, String userId, Double amount,
            String method) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        if (bookingOptional.isEmpty())
            return null;

        Booking booking = bookingOptional.get();
        String transactionId = "TXN" + System.currentTimeMillis()
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .booking(booking)
                .user(User.builder().id(userId).build())
                .amount(amount)
                .method(method)
                .status("completed")
                .transactionId(transactionId)
                .createdAt(LocalDateTime.now())
                .build();

        if (payment == null)
            return null; // Should not happen with builder but resolves warning

        paymentRepository.save(payment);

        // Update booking
        Booking.PaymentMethod paymentMethod;
        try {
            paymentMethod = Booking.PaymentMethod.valueOf(method.toLowerCase());
        } catch (Exception e) {
            paymentMethod = Booking.PaymentMethod.none;
        }

        Booking.PaymentInfo paymentInfo = Booking.PaymentInfo.builder()
                .amount(amount)
                .method(paymentMethod)
                .status(Booking.PaymentStatus.completed)
                .transactionId(transactionId)
                .paidAt(LocalDateTime.now())
                .build();

        booking.setPayment(paymentInfo);
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        return payment;
    }

    public List<Payment> getPaymentHistory(@org.springframework.lang.NonNull String userId) {
        return paymentRepository.findByUserOrderByCreatedAtDesc(User.builder().id(userId).build());
    }
}
