package com.parking.validator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    @NotBlank
    private String slotId;

    @NotBlank
    private String vehicleNumber;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
