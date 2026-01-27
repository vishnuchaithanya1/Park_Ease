package com.parking.validator.model;

import java.util.Map;

public class AnalyticsResponse {
    private int totalBookings;
    private int activeBookings;
    private int completedBookings;
    private double totalRevenue;
    private double averageDuration;
    private String peakHour;
    private Map<String, Integer> slotUsage;
    private Map<String, Integer> sectionUsage;

    // Constructors
    public AnalyticsResponse() {
    }

    // Getters and Setters
    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(int activeBookings) {
        this.activeBookings = activeBookings;
    }

    public int getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(int completedBookings) {
        this.completedBookings = completedBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getAverageDuration() {
        return averageDuration;
    }

    public void setAverageDuration(double averageDuration) {
        this.averageDuration = averageDuration;
    }

    public String getPeakHour() {
        return peakHour;
    }

    public void setPeakHour(String peakHour) {
        this.peakHour = peakHour;
    }

    public Map<String, Integer> getSlotUsage() {
        return slotUsage;
    }

    public void setSlotUsage(Map<String, Integer> slotUsage) {
        this.slotUsage = slotUsage;
    }

    public Map<String, Integer> getSectionUsage() {
        return sectionUsage;
    }

    public void setSectionUsage(Map<String, Integer> sectionUsage) {
        this.sectionUsage = sectionUsage;
    }
}
