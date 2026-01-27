package com.parking.validator.model;

public class ValidationResponse {
    private boolean valid;
    private String message;
    private String slotNumber;

    // Constructors
    public ValidationResponse() {
    }

    public ValidationResponse(boolean valid, String message, String slotNumber) {
        this.valid = valid;
        this.message = message;
        this.slotNumber = slotNumber;
    }

    // Getters and Setters
    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }
}
