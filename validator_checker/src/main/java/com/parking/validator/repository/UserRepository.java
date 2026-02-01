package com.parking.validator.repository;

import com.parking.validator.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Optional<User> findByVehicleNumber(String vehicleNumber);

    boolean existsByEmail(String email);

    boolean existsByVehicleNumber(String vehicleNumber);
}
