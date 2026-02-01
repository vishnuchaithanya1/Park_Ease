package com.parking.validator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    @DBRef
    private Booking booking;

    @DBRef
    private User user;

    private Double amount;
    private String method;
    @Builder.Default
    private String status = "pending";
    private String transactionId;
    private Map<String, Object> metadata;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
