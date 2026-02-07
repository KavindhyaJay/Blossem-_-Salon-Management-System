package com.blossem.backend.repository;

import com.blossem.backend.model.Login;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LoginRepository extends MongoRepository<Login, String> {
    Optional<Login> findByUsername(String username);
}
