package com.parking.validator.repository;

import com.parking.validator.model.Slot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends MongoRepository<Slot, String> {
    Optional<Slot> findBySlotNumber(String slotNumber);

    List<Slot> findByIsAvailable(boolean isAvailable);

    List<Slot> findByCityAndAreaAndIsAvailable(String city, String area, boolean isAvailable);

    // Location filtering methods
    List<Slot> findByCity(String city);

    List<Slot> findByCityAndArea(String city, String area);

    List<Slot> findByCityAndAreaAndAddress(String city, String area, String address);

    // Get distinct values for location dropdowns
    @Query(value = "{}", fields = "{ 'city' : 1 }")
    List<Slot> findAllProjectedBy();

    @Query(value = "{ 'city': ?0 }", fields = "{ 'area' : 1 }")
    List<Slot> findAreasByCity(String city);

    @Query(value = "{ 'city': ?0, 'area': ?1 }", fields = "{ 'address' : 1 }")
    List<Slot> findAddressesByCityAndArea(String city, String area);
}
