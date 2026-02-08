package com.blossem.reception_service.repository;

import com.blossem.reception_service.model.Bookingcustomer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingcustomerRepository extends MongoRepository<Bookingcustomer, String> {
    List<Bookingcustomer> findByEmail(String email);

    Optional<Bookingcustomer> findFirstByEmailOrderByDateDesc(String email);
}
