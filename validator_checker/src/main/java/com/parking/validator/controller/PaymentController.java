package com.parking.validator.controller;

import com.parking.validator.model.Payment;
import com.parking.validator.security.service.UserDetailsImpl;
import com.parking.validator.service.FeeCalculationService;
import com.parking.validator.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FeeCalculationService feeCalculationService;

    @PostMapping("/calculate")
    public ResponseEntity<?> calculatePayment(@RequestBody Map<String, String> request) {
        String startTimeStr = request.get("startTime");
        String endTimeStr = request.get("endTime");

        if (startTimeStr == null || endTimeStr == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Start time and end time are required");
            return ResponseEntity.status(400).body(error);
        }

        LocalDateTime start = LocalDateTime.parse(startTimeStr);
        LocalDateTime end = LocalDateTime.parse(endTimeStr);

        FeeCalculationService.FeeDetails feeDetails = feeCalculationService.calculateFee(start, end);

        Map<String, Object> response = new HashMap<>();
        response.put("durationHours", (double) feeDetails.getActualDuration() / 60.0);
        response.put("amount", feeDetails.getFee());
        response.put("breakdown", feeCalculationService.getFeeBreakdown(start, end));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request) {
        String bookingId = (String) request.get("bookingId");
        Double amount = request.get("amount") instanceof Integer ? ((Integer) request.get("amount")).doubleValue()
                : (Double) request.get("amount");
        String method = (String) request.get("method");

        if (bookingId == null || amount == null || method == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "BookingId, amount, and method are required");
            return ResponseEntity.status(400).body(error);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();

        Payment payment = paymentService.processPayment(bookingId, userDetails.getId(), amount, method);
        if (payment == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Booking not found");
            return ResponseEntity.status(404).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment processed successfully");
        response.put("transactionId", payment.getTransactionId());
        response.put("payment", payment);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Payment>> getPaymentHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        String userId = userDetails.getId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(paymentService.getPaymentHistory(userId));
    }
}
