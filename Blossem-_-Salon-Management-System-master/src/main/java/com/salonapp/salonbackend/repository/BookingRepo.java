package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepo extends MongoRepository<Booking, String> {
    List<Booking> findByEmail(String email);

    List<Booking> findByStaffEmail(String email);

    List<Booking> findByPayment(String status);
}
