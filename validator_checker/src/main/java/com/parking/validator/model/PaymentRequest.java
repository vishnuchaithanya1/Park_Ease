package com.parking.validator.model;

import java.time.LocalDateTime;

public class PaymentRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Constructors
    public PaymentRequest() {
    }

    public PaymentRequest(LocalDateTime startTime, LocalDateTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}
