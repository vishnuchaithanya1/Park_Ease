package com.parking.validator.controller;

import com.parking.validator.model.Slot;
import com.parking.validator.model.User;
import com.parking.validator.service.SlotService;
import com.parking.validator.service.UserService;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private SlotService slotService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome Admin! You have full access.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{userId}/details")
    public ResponseEntity<?> getUserDetails(@PathVariable @org.springframework.lang.NonNull String userId) {
        Map<String, Object> details = userService.getUserDetails(userId);
        if (details == null)
            return ResponseEntity.status(404).body("User not found");
        return ResponseEntity.ok(details);
    }

    @PostMapping("/create-slot")
    public ResponseEntity<?> createSlot(@RequestBody Slot slot) {
        if (slot.getSlotNumber() == null) {
            slot.setSlotNumber("A" + System.currentTimeMillis() % 1000);
        }

        Slot createdSlot = slotService.createSlot(slot);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Slot created successfully");
        response.put("slot", createdSlot);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/slot/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable @org.springframework.lang.NonNull String id,
            @RequestBody Slot slotDetails) {
        Optional<Slot> slotOptional = slotService.getSlotById(id);
        if (slotOptional.isEmpty())
            return ResponseEntity.status(404).body("Slot not found");

        Slot slot = slotOptional.get();
        if (slotDetails.getSlotNumber() != null)
            slot.setSlotNumber(slotDetails.getSlotNumber());
        if (slotDetails.getSection() != null)
            slot.setSection(slotDetails.getSection());
        slot.setAvailable(slotDetails.isAvailable());

        return ResponseEntity.ok(slotService.updateSlot(slot));
    }

    @DeleteMapping("/slot/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable @org.springframework.lang.NonNull String id) {
        slotService.deleteSlot(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Slot deleted successfully");
        return ResponseEntity.ok(response);
    }
}
