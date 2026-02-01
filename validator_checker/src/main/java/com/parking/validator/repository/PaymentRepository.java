package com.parking.validator.repository;

import com.parking.validator.model.Payment;
import com.parking.validator.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
}
