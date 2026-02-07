package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepo extends MongoRepository<Appointment, String> {

    // Use the exact MongoDB field names from Appointment.java
    List<Appointment> findByEmail(String email);          // Customer email
    List<Appointment> findByStaffEmail(String staffEmail); // Staff email
    List<Appointment> findByPayment(String payment);      // Payment status
}
