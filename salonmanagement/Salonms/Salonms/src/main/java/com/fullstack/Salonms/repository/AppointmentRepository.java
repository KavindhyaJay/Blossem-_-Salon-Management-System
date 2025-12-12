// File: AppointmentRepository.java
package com.fullstack.Salonms.repository;

import com.fullstack.Salonms.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    // Only this method is needed for calendar view
    List<Appointment> findByDate(String date);
}