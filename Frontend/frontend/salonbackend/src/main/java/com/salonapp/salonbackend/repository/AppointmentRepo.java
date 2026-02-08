package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.AppointmentDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentRepo extends MongoRepository<AppointmentDoc, String> {
    List<AppointmentDoc> findByEmail(String email);
}
