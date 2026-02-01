package com.parking.validator.controller;

import com.parking.validator.dto.AlertRequest;
import com.parking.validator.model.Alert;
import com.parking.validator.model.Slot;
import com.parking.validator.service.AlertService;
import com.parking.validator.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private SlotService slotService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAlert(@RequestBody AlertRequest request) {
        if (request.getSlotId() == null && request.getArea() == null && request.getCity() == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Alert must target a slot, area, or city"));
        }

        Alert alert = Alert.builder()
                .message(request.getMessage())
                .type(request.getType())
                .severity(request.getSeverity())
                .area(request.getArea())
                .city(request.getCity())
                .expiresAt(request.getExpiresAt())
                .build();

        if (request.getSlotId() != null) {
            Optional<Slot> slotOptional = slotService
                    .getSlotById(java.util.Objects.requireNonNull(request.getSlotId()));
            if (slotOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Slot not found"));
            }
            alert.setSlot(slotOptional.get());
        }

        Alert createdAlert = alertService.createAlert(alert);
        return ResponseEntity.status(201).body(createdAlert);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @GetMapping("/slot/{slotId}")
    public ResponseEntity<List<Alert>> getSlotAlerts(@PathVariable @org.springframework.lang.NonNull String slotId) {
        return ResponseEntity.ok(alertService.getSlotAlerts(slotId));
    }

    @GetMapping("/area/{area}")
    public ResponseEntity<List<Alert>> getAreaAlerts(@PathVariable String area) {
        return ResponseEntity.ok(alertService.getAreaAlerts(area));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Alert>> getCityAlerts(@PathVariable String city) {
        return ResponseEntity.ok(alertService.getCityAlerts(city));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAlert(@PathVariable @org.springframework.lang.NonNull String id,
            @RequestBody Alert alertDetails) {
        Optional<Alert> alertOptional = alertService.getAlertById(id);
        if (alertOptional.isEmpty())
            return ResponseEntity.status(404).body("Alert not found");

        Alert alert = alertOptional.get();
        if (alertDetails.getMessage() != null)
            alert.setMessage(alertDetails.getMessage());
        if (alertDetails.getType() != null)
            alert.setType(alertDetails.getType());
        if (alertDetails.getSeverity() != null)
            alert.setSeverity(alertDetails.getSeverity());
        alert.setActive(alertDetails.isActive());
        if (alertDetails.getExpiresAt() != null)
            alert.setExpiresAt(alertDetails.getExpiresAt());

        return ResponseEntity.ok(alertService.updateAlert(alert));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAlert(@PathVariable @org.springframework.lang.NonNull String id) {
        alertService.deleteAlert(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Alert deleted successfully");
        return ResponseEntity.ok(response);
    }
}
