package com.blossem.reception_service.repository;

import com.blossem.reception_service.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByEmail(String email);

    Optional<Booking> findFirstByEmailOrderByDateDesc(String email);
}
