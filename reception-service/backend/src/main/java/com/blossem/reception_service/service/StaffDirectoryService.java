package com.blossem.reception_service.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.blossem.reception_service.model.StaffMember;
import com.blossem.reception_service.repository.StaffRepository;

@Service
public class StaffDirectoryService {

    private final StaffRepository staffRepository;

    public StaffDirectoryService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    public Optional<StaffMember> findByName(String staffName) {
        if (staffName == null || staffName.isBlank()) {
            return Optional.empty();
        }
        return staffRepository.findFirstByNameIgnoreCase(staffName.trim());
    }

    public Optional<String> findEmailByName(String staffName) {
        return findByName(staffName)
                .map(StaffMember::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .map(String::trim);
    }
}
