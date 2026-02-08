package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Staff;
import com.salonapp.salonbackend.repository.StaffRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StaffService {
    private final StaffRepo repo;

    public StaffService(StaffRepo repo) {
        this.repo = repo;
    }

    public List<Staff> getAllStaff() {
        return repo.findAll();
    }
}
