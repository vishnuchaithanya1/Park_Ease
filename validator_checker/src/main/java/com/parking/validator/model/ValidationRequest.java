package com.parking.validator.model;

public class ValidationRequest {
    private String slotId;
    private String slotNumber;
    private String vehicleNumber;
    private String startTime;
    private String endTime;

    // Constructors
    public ValidationRequest() {
    }

    public ValidationRequest(String slotId, String slotNumber, String vehicleNumber,
            String startTime, String endTime) {
        this.slotId = slotId;
        this.slotNumber = slotNumber;
        this.vehicleNumber = vehicleNumber;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public String getSlotId() {
        return slotId;
    }

    public void setSlotId(String slotId) {
        this.slotId = slotId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
