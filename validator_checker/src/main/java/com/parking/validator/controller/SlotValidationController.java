package com.parking.validator.controller;

import com.parking.validator.model.ValidationRequest;
import com.parking.validator.model.ValidationResponse;
import com.parking.validator.service.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow requests from Node.js backend
public class SlotValidationController {

    @Autowired
    private ValidationService validationService;

    @GetMapping("/health")
    public String health() {
        return "Parking Validator Service is running! ✅";
    }

    @PostMapping("/validate-slot")
    public ValidationResponse validateSlot(@RequestBody ValidationRequest request) {
        System.out.println("📥 Received validation request for slot: " + request.getSlotNumber());

        ValidationResponse response = validationService.validateSlot(request);

        if (response.isValid()) {
            System.out.println("✅ Validation passed for slot: " + request.getSlotNumber());
        } else {
            System.out.println("❌ Validation failed: " + response.getMessage());
        }

        return response;
    }
}
