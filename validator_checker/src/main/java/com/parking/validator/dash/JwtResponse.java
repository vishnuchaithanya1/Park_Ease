package com.parking.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private UserResponse user;

    @Data
    @AllArgsConstructor
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String role;
        private List<String> roles;
    }
}
