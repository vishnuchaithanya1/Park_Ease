package com.parking.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInviteResponse {
    private String token;
    private String message;
    private long expiresAt;
}
