package com.parking.validator.service;

import com.parking.validator.model.Slot;
import com.parking.validator.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SlotService {
    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private WebSocketService webSocketService;

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    public Optional<Slot> getSlotById(@org.springframework.lang.NonNull String id) {
        return slotRepository.findById(id);
    }

    @org.springframework.lang.Nullable
    public Slot updateSlotAvailability(@org.springframework.lang.NonNull String id, boolean isAvailable) {
        Optional<Slot> slotOptional = slotRepository.findById(id);
        if (slotOptional.isPresent()) {
            Slot slot = slotOptional.get();
            slot.setAvailable(isAvailable);
            Slot updatedSlot = slotRepository.save(slot);
            webSocketService.emitSlotUpdate(updatedSlot);
            return updatedSlot;
        }
        return null;
    }

    public Slot createSlot(@org.springframework.lang.NonNull Slot slot) {
        Slot savedSlot = slotRepository.save(slot);
        webSocketService.emitSlotUpdate(savedSlot);
        return savedSlot;
    }

    public Slot updateSlot(@org.springframework.lang.NonNull Slot slot) {
        return slotRepository.save(slot);
    }

    public void deleteSlot(@org.springframework.lang.NonNull String id) {
        slotRepository.deleteById(id);
    }

    // Location filtering methods
    public List<String> getUniqueCities() {
        return slotRepository.findAll().stream()
                .map(Slot::getCity)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getUniqueAreas(String city) {
        if (city == null || city.isEmpty()) {
            return slotRepository.findAll().stream()
                    .map(Slot::getArea)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
        }
        return slotRepository.findByCity(city).stream()
                .map(Slot::getArea)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getUniqueAddresses(String city, String area) {
        if (city == null || city.isEmpty()) {
            return slotRepository.findAll().stream()
                    .map(Slot::getAddress)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
        }
        if (area == null || area.isEmpty()) {
            return slotRepository.findByCity(city).stream()
                    .map(Slot::getAddress)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
        }
        return slotRepository.findByCityAndArea(city, area).stream()
                .map(Slot::getAddress)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<Slot> getSlotsByLocation(String city, String area, String address) {
        if (city != null && !city.isEmpty() && area != null && !area.isEmpty() && address != null
                && !address.isEmpty()) {
            return slotRepository.findByCityAndAreaAndAddress(city, area, address);
        } else if (city != null && !city.isEmpty() && area != null && !area.isEmpty()) {
            return slotRepository.findByCityAndArea(city, area);
        } else if (city != null && !city.isEmpty()) {
            return slotRepository.findByCity(city);
        }
        return slotRepository.findAll();
    }
}
