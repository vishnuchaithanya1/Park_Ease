package com.parking.validator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "companies")
public class Company {
    @Id
    private String id;

    private String name;
    private String address;
    private String website;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
