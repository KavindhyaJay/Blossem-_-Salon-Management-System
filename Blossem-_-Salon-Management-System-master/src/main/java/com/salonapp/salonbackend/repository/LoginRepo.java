package com.salonapp.salonbackend.repository;

import com.salonapp.salonbackend.model.Login;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginRepo extends MongoRepository<Login, String> {
    Login findByEmail(String email);

    Login findByUsername(String username);
}
