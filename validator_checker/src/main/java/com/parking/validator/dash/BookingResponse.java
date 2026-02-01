package com.parking.validator.dto;

import com.parking.validator.model.Booking;
import com.parking.validator.model.Slot;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponse {
    private String message;
    private Booking booking;
    private Slot slot;
}
