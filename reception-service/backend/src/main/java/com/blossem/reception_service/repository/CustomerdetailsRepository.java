package com.blossem.reception_service.repository;

import com.blossem.reception_service.model.Customerdetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerdetailsRepository extends MongoRepository<Customerdetails, String> {
    Optional<Customerdetails> findByEmail(String email);

    List<Customerdetails> findAllByEmailIgnoreCase(String email);
}
