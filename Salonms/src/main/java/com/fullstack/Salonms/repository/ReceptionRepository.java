// File: ReceptionRepository.java
package com.fullstack.Salonms.repository;

import com.fullstack.Salonms.model.Reception;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReceptionRepository extends MongoRepository<Reception, String> {
    Optional<Reception> findByEmail(String email);
    boolean existsByEmail(String email);
}