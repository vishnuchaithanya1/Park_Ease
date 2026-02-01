package com.parking.validator.service;

import com.parking.validator.model.Alert;
import com.parking.validator.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private WebSocketService webSocketService;

    public Alert createAlert(Alert alert) {
        alert.setCreatedAt(LocalDateTime.now());
        alert.setUpdatedAt(LocalDateTime.now());
        Alert savedAlert = alertRepository.save(alert);
        webSocketService.emitAlert(savedAlert);
        return savedAlert;
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findActiveAlerts(LocalDateTime.now());
    }

    public List<Alert> getSlotAlerts(String slotId) {
        return alertRepository.findBySlotAndActive(slotId, LocalDateTime.now());
    }

    public List<Alert> getAreaAlerts(String area) {
        return alertRepository.findByAreaAndActive(area, LocalDateTime.now());
    }

    public List<Alert> getCityAlerts(String city) {
        return alertRepository.findByCityAndActive(city, LocalDateTime.now());
    }

    public Optional<Alert> getAlertById(@org.springframework.lang.NonNull String id) {
        return alertRepository.findById(id);
    }

    public Alert updateAlert(Alert alert) {
        alert.setUpdatedAt(LocalDateTime.now());
        return alertRepository.save(alert);
    }

    public void deleteAlert(@org.springframework.lang.NonNull String id) {
        alertRepository.deleteById(id);
        webSocketService.emitAlertDeleted(id);
    }
}
