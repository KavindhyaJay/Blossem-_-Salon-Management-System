package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AppointmentRepo extends MongoRepository<Appointment, String> {
    List<Appointment> findByCustomerEmail(String customerEmail);
    List<Appointment> findByStaffEmail(String staffEmail);
    List<Appointment> findByPayment(String payment);
}
