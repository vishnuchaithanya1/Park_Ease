package com.parking.validator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "alerts")
public class Alert {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;

    @DBRef
    private Slot slot;

    @Indexed
    private String area;

    @Indexed
    private String city;

    private String message;
    private AlertType type;
    @Builder.Default
    private Severity severity = Severity.info;

    @DBRef
    private User createdBy;

    @Indexed
    @Builder.Default
    private boolean isActive = true;

    @Indexed
    private LocalDateTime expiresAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AlertType {
        construction, maintenance, closure, warning, info
    }

    public enum Severity {
        info, warning, critical
    }
}
