package com.parking.validator.service;

import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class ParkingTimerService {

    public long calculateDuration(LocalDateTime entryTime, LocalDateTime exitTime) {
        if (entryTime == null || exitTime == null) {
            return 0;
        }
        return Duration.between(entryTime, exitTime).toMinutes();
    }

    public String getFormattedDuration(long durationMinutes) {
        long hours = durationMinutes / 60;
        long minutes = durationMinutes % 60;
        return String.format("%dh %dm", hours, minutes);
    }
}
