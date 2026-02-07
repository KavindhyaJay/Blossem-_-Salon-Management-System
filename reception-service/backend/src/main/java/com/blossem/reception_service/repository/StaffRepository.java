package com.blossem.reception_service.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.blossem.reception_service.model.StaffMember;

public interface StaffRepository extends MongoRepository<StaffMember, String> {
    Optional<StaffMember> findFirstByNameIgnoreCase(String name);
}
