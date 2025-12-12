package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Staff;
import com.fullstack.Salonms.repository.StaffRepository;
import com.fullstack.Salonms.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffServiceImpl implements StaffService {
    @Autowired
    private StaffRepository staffRepository;

    @Override
    public Staff createStaff(Staff staff) {
        // Set default status if not provided
        if (staff.getStatus() == null || staff.getStatus().isEmpty()) {
            staff.setStatus("Active");
        }
        return staffRepository.save(staff);
    }
    @Override
    public Optional<Staff> getById(String id) {
        return staffRepository.findById(id);
    }

    // If you want getStaffById returning Staff directly
    @Override
    public Staff getStaffById(String id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));
    }


    @Override
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }


    @Override
    public Staff updateStaff(String id, Staff staffDetails) {
        Optional<Staff> optionalStaff = staffRepository.findById(id);

        if (optionalStaff.isPresent()) {
            Staff staff = optionalStaff.get();

            // Update fields if they are not null
            if (staffDetails.getName() != null) {
                staff.setName(staffDetails.getName());
            }

            if (staffDetails.getSpecialization() != null) {
                staff.setSpecialization(staffDetails.getSpecialization());
            }
            if (staffDetails.getStatus() != null) {
                staff.setStatus(staffDetails.getStatus());
            }
            return staffRepository.save(staff);
        }
        else {
            throw new RuntimeException("Staff not found with id: " + id);
        }
    }
    @Override
    public void deleteStaff(String id) {
        if (staffRepository.existsById(id)) {
            staffRepository.deleteById(id);
        } else {
            throw new RuntimeException("Staff not found with id: " + id);
        }
    }
        }
