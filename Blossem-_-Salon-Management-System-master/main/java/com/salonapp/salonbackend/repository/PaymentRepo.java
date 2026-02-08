package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepo extends MongoRepository<Payment, String> {
    List<Payment> findByPayment(String payment); // "Paid" or "Pending"
}
