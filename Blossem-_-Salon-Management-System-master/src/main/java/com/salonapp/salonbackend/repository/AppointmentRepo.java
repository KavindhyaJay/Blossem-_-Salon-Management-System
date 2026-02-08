package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepo extends MongoRepository<Appointment, String> {
    List<Appointment> findByCustomerEmail(String email);

    List<Appointment> findByStaffEmail(String email);

    List<Appointment> findByPayment(String status);
}
