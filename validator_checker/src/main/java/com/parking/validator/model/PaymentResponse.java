package com.parking.validator.model;

public class PaymentResponse {
    private double amount;
    private double durationHours;
    private String breakdown;

    // Constructors
    public PaymentResponse() {
    }

    public PaymentResponse(double amount, double durationHours, String breakdown) {
        this.amount = amount;
        this.durationHours = durationHours;
        this.breakdown = breakdown;
    }

    // Getters and Setters
    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public double getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(double durationHours) {
        this.durationHours = durationHours;
    }

    public String getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(String breakdown) {
        this.breakdown = breakdown;
    }
}
