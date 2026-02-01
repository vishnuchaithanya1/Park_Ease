package com.parking.validator.dto;

import com.parking.validator.model.Alert.AlertType;
import com.parking.validator.model.Alert.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRequest {
    private String message;
    private AlertType type;
    private Severity severity;
    private String slotId;
    private String area;
    private String city;
    private LocalDateTime expiresAt;
}
