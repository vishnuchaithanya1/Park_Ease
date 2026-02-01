package com.parking.validator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String identifier; // email or vehicleNumber

    @NotBlank
    private String password;

    private String adminSecret;
}
