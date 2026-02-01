package com.parking.validator.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FeeCalculationService {
    private final Double BASE_FEE = 20.0;
    private final Double RATE_PER_15_MIN = 5.0;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeDetails {
        private long actualDuration;
        private long roundedDuration;
        private Double fee;
    }

    public FeeDetails calculateFee(long durationMinutes) {
        if (durationMinutes <= 0) {
            return FeeDetails.builder()
                    .actualDuration(0)
                    .roundedDuration(0)
                    .fee(BASE_FEE)
                    .build();
        }

        long roundedMinutes = roundUpTo15Minutes(durationMinutes);
        Double timeCharge = (roundedMinutes / 15.0) * RATE_PER_15_MIN;
        Double fee = BASE_FEE + timeCharge;

        return FeeDetails.builder()
                .actualDuration(durationMinutes)
                .roundedDuration(roundedMinutes)
                .fee(fee)
                .build();
    }

    public FeeDetails calculateFee(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null)
            return calculateFee(0);
        long durationMinutes = java.time.Duration.between(start, end).toMinutes();
        return calculateFee(durationMinutes);
    }

    private long roundUpTo15Minutes(long minutes) {
        if (minutes <= 0)
            return 0;
        return (long) Math.ceil(minutes / 15.0) * 15;
    }

    public String getFeeBreakdown(long durationMinutes) {
        FeeDetails details = calculateFee(durationMinutes);
        Double timeCharge = details.getFee() - BASE_FEE;
        long hours = details.getRoundedDuration() / 60;
        long minutes = details.getRoundedDuration() % 60;

        return String.format(
                "Duration: %d min -> Charged: %d min (%dh %dm) -> Base: ₹%.2f + Time: ₹%.2f = Total: ₹%.2f",
                durationMinutes, details.getRoundedDuration(), hours, minutes, BASE_FEE, timeCharge, details.getFee());
    }

    public String getFeeBreakdown(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null)
            return "Invalid duration";
        long durationMinutes = java.time.Duration.between(start, end).toMinutes();
        return getFeeBreakdown(durationMinutes);
    }
}
