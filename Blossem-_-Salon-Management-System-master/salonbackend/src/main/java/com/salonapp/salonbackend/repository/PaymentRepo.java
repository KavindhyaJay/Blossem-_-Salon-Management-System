package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.PaymentDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepo extends MongoRepository<PaymentDoc, String> {
    PaymentDoc findByAppointmentId(String appointmentId);
}