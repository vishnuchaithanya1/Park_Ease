package com.parking.validator.repository;

import com.parking.validator.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.time.LocalDateTime;

public interface AlertRepository extends MongoRepository<Alert, String> {

    @Query("{ 'isActive': true, $or: [ { 'expiresAt': null }, { 'expiresAt': { $gt: ?0 } } ] }")
    List<Alert> findActiveAlerts(LocalDateTime now);

    @Query("{ 'slot': ?0, 'isActive': true, $or: [ { 'expiresAt': null }, { 'expiresAt': { $gt: ?1 } } ] }")
    List<Alert> findBySlotAndActive(String slotId, LocalDateTime now);

    @Query("{ 'area': ?0, 'isActive': true, $or: [ { 'expiresAt': null }, { 'expiresAt': { $gt: ?1 } } ] }")
    List<Alert> findByAreaAndActive(String area, LocalDateTime now);

    @Query("{ 'city': ?0, 'isActive': true, $or: [ { 'expiresAt': null }, { 'expiresAt': { $gt: ?1 } } ] }")
    List<Alert> findByCityAndActive(String city, LocalDateTime now);
}
