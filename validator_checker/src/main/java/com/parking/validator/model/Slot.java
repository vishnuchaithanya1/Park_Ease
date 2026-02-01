package com.parking.validator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "slots")
@CompoundIndex(name = "location_availability_idx", def = "{'city': 1, 'area': 1, 'isAvailable': 1}")
public class Slot {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String slotNumber;

    @Indexed
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isAvailable")
    private boolean isAvailable = true;

    private Double latitude;
    private Double longitude;

    private Location location;

    @Builder.Default
    private String city = "Hyderabad";
    @Builder.Default
    private String area = "Madhapur";
    @Builder.Default
    private String address = "Smart Parking Complex";

    @Builder.Default
    private String placeType = "Shopping Mall";
    private String imageUrl;
    @Builder.Default
    private String section = "General";

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private Double x;
        private Double y;
    }
}
