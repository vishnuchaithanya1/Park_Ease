package com.parking.validator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Slot slot;

    private String vehicleNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private LocalDateTime actualEntryTime;
    private LocalDateTime actualExitTime;
    private Integer actualDuration; // in minutes

    @Builder.Default
    private ParkingStatus parkingStatus = ParkingStatus.SCHEDULED;
    @Builder.Default
    private BookingStatus status = BookingStatus.BOOKED;

    private PaymentInfo payment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ParkingStatus {
        SCHEDULED, CHECKED_IN, CHECKED_OUT
    }

    public enum BookingStatus {
        BOOKED, COMPLETED, CANCELLED
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentInfo {
        @Builder.Default
        private Double amount = 0.0;
        @Builder.Default
        private PaymentMethod method = PaymentMethod.none;
        @Builder.Default
        private PaymentStatus status = PaymentStatus.pending;
        private String transactionId;
        private LocalDateTime paidAt;
    }

    public enum PaymentMethod {
        credit_card, paypal, upi, none
    }

    public enum PaymentStatus {
        pending, completed, failed
    }
}
