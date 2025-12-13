package com.fullstack.Salonms.repository;

import com.fullstack.Salonms.model.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends MongoRepository<Staff, String> {
    Optional<Staff> findByEmail(String email); // Make sure this exists!
}