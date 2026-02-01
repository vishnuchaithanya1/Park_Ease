package com.parking.validator.repository;

import com.parking.validator.model.Booking;
import com.parking.validator.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    List<Booking> findByParkingStatus(Booking.ParkingStatus parkingStatus);
}
