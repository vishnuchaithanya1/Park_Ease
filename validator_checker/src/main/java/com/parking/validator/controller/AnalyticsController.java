package com.parking.validator.controller;

import com.parking.validator.model.*;
import com.parking.validator.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get comprehensive analytics statistics
     */
    @PostMapping("/stats")
    public ResponseEntity<?> getStatistics(@RequestBody AnalyticsRequest request) {
        try {
            AnalyticsResponse analytics = analyticsService.calculateAnalytics(request.getBookings());
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Failed to calculate analytics: " + e.getMessage()));
        }
    }

    /**
     * Calculate payment amount for booking duration
     */
    @PostMapping("/calculate-payment")
    public ResponseEntity<?> calculatePayment(@RequestBody PaymentRequest request) {
        try {
            PaymentResponse payment = analyticsService.calculatePayment(
                    request.getStartTime(),
                    request.getEndTime());
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Failed to calculate payment: " + e.getMessage()));
        }
    }

    /**
     * Health check for analytics service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Analytics service is running");
    }

    // Error response class
    @SuppressWarnings("unused") // getError() is used by Jackson for JSON serialization
    private static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }
}
