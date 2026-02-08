package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.CustomerDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CustomerRepo extends MongoRepository<CustomerDoc, String> {
    CustomerDoc findByEmail(String email);

}