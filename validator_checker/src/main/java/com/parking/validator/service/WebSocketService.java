package com.parking.validator.service;

import com.parking.validator.model.Slot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void emitSlotUpdate(@org.springframework.lang.NonNull Slot slot) {
        messagingTemplate.convertAndSend("/topic/slots", slot);
    }

    public void emitAlert(@org.springframework.lang.NonNull Object alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void emitBookingCreated(@org.springframework.lang.NonNull Object booking) {
        messagingTemplate.convertAndSend("/topic/bookings", booking);
    }

    public void emitAlertDeleted(@org.springframework.lang.NonNull String id) {
        messagingTemplate.convertAndSend("/topic/alerts/delete", id);
    }
}
