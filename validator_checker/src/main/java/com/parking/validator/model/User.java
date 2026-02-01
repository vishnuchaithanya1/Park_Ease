package com.parking.validator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    @Indexed(unique = true, sparse = true)
    private String vehicleNumber;

    private String vehicleType;
    private String phone;
    private LocalDateTime expiresAt;

    private Role role;

    public enum Role {
        user, admin
    }
}
