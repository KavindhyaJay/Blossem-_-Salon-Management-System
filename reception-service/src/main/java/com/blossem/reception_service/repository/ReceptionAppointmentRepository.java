package com.blossem.reception_service.repository;

import com.blossem.reception_service.model.ReceptionAppointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceptionAppointmentRepository extends MongoRepository<ReceptionAppointment, String> {
    Optional<ReceptionAppointment> findByBookingId(String bookingId);

    List<ReceptionAppointment> findByEmail(String email);
}
