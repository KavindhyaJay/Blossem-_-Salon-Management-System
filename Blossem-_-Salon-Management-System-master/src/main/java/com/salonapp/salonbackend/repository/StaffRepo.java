package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepo extends MongoRepository<Staff, String> {
    Staff findByEmail(String email);
}
