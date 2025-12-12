package com.fullstack.Salonms.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.fullstack.Salonms.model.Staff;

public interface StaffRepository extends MongoRepository<Staff, String> {

}
