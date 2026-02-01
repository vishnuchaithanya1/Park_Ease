package com.parking.validator.controller;

import com.parking.validator.model.Slot;
import com.parking.validator.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/slots")
public class SlotController {
    @Autowired
    private SlotService slotService;

    @GetMapping("/all")
    public ResponseEntity<Map<String, List<Slot>>> getAllSlots() {
        List<Slot> slots = slotService.getAllSlots();
        Map<String, List<Slot>> response = new HashMap<>();
        response.put("slots", slots);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{slotId}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable @org.springframework.lang.NonNull String slotId,
            @RequestBody Map<String, Boolean> body) {
        Boolean isAvailable = body.get("isAvailable");
        if (isAvailable == null)
            isAvailable = true; // Default
        Slot slot = slotService.updateSlotAvailability(slotId, isAvailable);

        if (slot == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Slot not found");
            return ResponseEntity.status(404).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Slot updated");
        response.put("slot", slot);
        return ResponseEntity.ok(response);
    }

    // Location filtering endpoints
    @GetMapping("/locations/cities")
    public ResponseEntity<Map<String, List<String>>> getUniqueCities() {
        List<String> cities = slotService.getUniqueCities();
        Map<String, List<String>> response = new HashMap<>();
        response.put("cities", cities);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/locations/areas")
    public ResponseEntity<Map<String, List<String>>> getUniqueAreas(@RequestParam(required = false) String city) {
        List<String> areas = slotService.getUniqueAreas(city);
        Map<String, List<String>> response = new HashMap<>();
        response.put("areas", areas);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/locations/addresses")
    public ResponseEntity<Map<String, List<String>>> getUniqueAddresses(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area) {
        List<String> addresses = slotService.getUniqueAddresses(city, area);
        Map<String, List<String>> response = new HashMap<>();
        response.put("addresses", addresses);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter")
    public ResponseEntity<Map<String, List<Slot>>> getSlotsByLocation(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String address) {
        List<Slot> slots = slotService.getSlotsByLocation(city, area, address);
        Map<String, List<Slot>> response = new HashMap<>();
        response.put("slots", slots);
        return ResponseEntity.ok(response);
    }
}
