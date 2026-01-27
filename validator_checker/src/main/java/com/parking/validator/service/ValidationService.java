package com.parking.validator.service;

import com.parking.validator.model.ValidationRequest;
import com.parking.validator.model.ValidationResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
public class ValidationService {

    private static final int MAX_BOOKING_HOURS = 24;
    private static final int MIN_BOOKING_MINUTES = 30;

    public ValidationResponse validateSlot(ValidationRequest request) {
        // 1. Validate vehicle number format
        if (request.getVehicleNumber() == null || request.getVehicleNumber().trim().isEmpty()) {
            return new ValidationResponse(false, "Vehicle number is required", request.getSlotNumber());
        }

        if (request.getVehicleNumber().length() < 3) {
            return new ValidationResponse(false, "Vehicle number must be at least 3 characters",
                    request.getSlotNumber());
        }

        // 2. Validate time range
        try {
            LocalDateTime startTime = LocalDateTime.parse(request.getStartTime(), DateTimeFormatter.ISO_DATE_TIME);
            LocalDateTime endTime = LocalDateTime.parse(request.getEndTime(), DateTimeFormatter.ISO_DATE_TIME);
            LocalDateTime now = LocalDateTime.now();

            // Debug logging
            System.out.println("=== BOOKING VALIDATION DEBUG ===");
            System.out.println("Start Time Received: " + request.getStartTime());
            System.out.println("End Time Received: " + request.getEndTime());
            System.out.println("Parsed Start Time: " + startTime);
            System.out.println("Parsed End Time: " + endTime);
            System.out.println("Current Server Time: " + now);
            System.out.println("Time difference (minutes): " + ChronoUnit.MINUTES.between(now, startTime));
            System.out.println("================================");

            // TEMPORARILY DISABLED - Allow all bookings for testing
            // Check if start time is in the past (allow 60 minute grace period for
            // immediate bookings and timezone differences)
            // if (startTime.isBefore(now.minusMinutes(60))) {
            // return new ValidationResponse(false, "Start time cannot be in the past",
            // request.getSlotNumber());
            // }

            // Check if end time is after start time
            if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
                return new ValidationResponse(false, "End time must be after start time", request.getSlotNumber());
            }

            // Check minimum booking duration (30 minutes)
            long minutesBetween = ChronoUnit.MINUTES.between(startTime, endTime);
            if (minutesBetween < MIN_BOOKING_MINUTES) {
                return new ValidationResponse(false,
                        "Minimum booking duration is " + MIN_BOOKING_MINUTES + " minutes",
                        request.getSlotNumber());
            }

            // Check maximum booking duration (24 hours)
            long hoursBetween = ChronoUnit.HOURS.between(startTime, endTime);
            if (hoursBetween > MAX_BOOKING_HOURS) {
                return new ValidationResponse(false,
                        "Maximum booking duration is " + MAX_BOOKING_HOURS + " hours",
                        request.getSlotNumber());
            }

        } catch (Exception e) {
            System.out.println("ERROR parsing datetime: " + e.getMessage());
            return new ValidationResponse(false, "Invalid time format", request.getSlotNumber());
        }

        // 3. All validations passed
        return new ValidationResponse(true,
                "Slot " + request.getSlotNumber() + " is valid for booking",
                request.getSlotNumber());
    }
}
