// File: StaffServiceImpl.java (Updated for Spring Security JWT)
package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Staff;
import com.fullstack.Salonms.repository.StaffRepository;
import com.fullstack.Salonms.service.StaffService;
import com.fullstack.Salonms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StaffServiceImpl implements StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Staff createStaff(Staff staff) {
        // Set default status if not provided
        if (staff.getStatus() == null || staff.getStatus().isEmpty()) {
            staff.setStatus("Pending"); // Default to Pending
        } else {
            // Normalize status to standard format
            staff.setStatus(normalizeStatus(staff.getStatus()));
        }

        // Ensure auth fields are null for new staff
        staff.setPasswordHash(null);
        staff.setHasActivated(false);
        staff.setActivatedAt(null);
        staff.setLastLogin(null);

        return staffRepository.save(staff);
    }

    @Override
    public Map<String, Object> loginStaff(String email, String password) {
        Optional<Staff> staffOpt = staffRepository.findByEmail(email);

        if (staffOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        Staff staff = staffOpt.get();
        String currentStatus = staff.getStatus();

        // ====== CASE-INSENSITIVE STATUS CHECKING ======
        String normalizedStatus = normalizeStatus(currentStatus);

        // 1. Check if account is INACTIVE (any case)
        if ("INACTIVE".equalsIgnoreCase(normalizedStatus) ||
                "DEACTIVATED".equalsIgnoreCase(normalizedStatus)) {
            throw new RuntimeException("Account is deactivated. Contact admin.");
        }

        // 2. Check if password is set
        boolean hasPassword = staff.getPasswordHash() != null;

        if (!hasPassword) {
            // FIRST-TIME LOGIN: No password yet

            // Allow activation if status is PENDING (any case) or ACTIVE but no password
            boolean canActivate = "PENDING".equalsIgnoreCase(normalizedStatus) ||
                    "PENDING_ACTIVATION".equalsIgnoreCase(normalizedStatus) ||
                    ("ACTIVE".equalsIgnoreCase(normalizedStatus) && !hasPassword);

            if (!canActivate) {
                throw new RuntimeException("Account status '" + currentStatus + "' cannot be activated. Contact admin.");
            }

            // Set password and activate account
            staff.setPasswordHash(passwordEncoder.encode(password));
            staff.setHasActivated(true);
            staff.setStatus("Active"); // Store as "Active" in DB
            staff.setActivatedAt(new Date());
            staff.setLastLogin(new Date());
            staffRepository.save(staff);

            return createLoginResponse(staff, true, "Account activated successfully!");

        } else {
            // REGULAR LOGIN: Password exists

            // Verify password
            if (!passwordEncoder.matches(password, staff.getPasswordHash())) {
                throw new RuntimeException("Invalid email or password");
            }

            // Check if account is active (any case)
            if ("INACTIVE".equalsIgnoreCase(normalizedStatus) ||
                    "DEACTIVATED".equalsIgnoreCase(normalizedStatus)) {
                throw new RuntimeException("Account is deactivated. Contact admin.");
            }

            // Update status to Active if it was Pending
            if ("PENDING".equalsIgnoreCase(normalizedStatus) ||
                    "PENDING_ACTIVATION".equalsIgnoreCase(normalizedStatus)) {
                staff.setStatus("Active");
            }

            // Update last login
            staff.setLastLogin(new Date());
            staffRepository.save(staff);

            return createLoginResponse(staff, false, "Login successful");
        }
    }

    private Map<String, Object> createLoginResponse(Staff staff, boolean firstLogin, String message) {
        String token = jwtUtil.generateToken(staff.getId(), staff.getEmail(), "STAFF");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("staff", staff);
        response.put("role", "STAFF");
        response.put("firstLogin", firstLogin);
        response.put("message", message);

        return response;
    }

    // Helper method to normalize status (case-insensitive)
    private String normalizeStatus(String status) {
        if (status == null || status.isEmpty()) {
            return "Pending";
        }

        String lowerStatus = status.trim().toLowerCase();

        if (lowerStatus.contains("pending") || lowerStatus.contains("activation")) {
            return "Pending";
        } else if (lowerStatus.contains("active")) {
            return "Active";
        } else if (lowerStatus.contains("inactive") || lowerStatus.contains("deactivated")) {
            return "Inactive";
        }

        return status; // Return original if no match
    }

    @Override
    public Staff getStaffByEmail(String email) {
        return staffRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
    }

    @Override
    public Optional<Staff> getById(String id) {
        return staffRepository.findById(id);
    }

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

            if (staffDetails.getName() != null) {
                staff.setName(staffDetails.getName());
            }
            if (staffDetails.getEmail() != null) {
                staff.setEmail(staffDetails.getEmail());
            }
            if (staffDetails.getSpecialization() != null) {
                staff.setSpecialization(staffDetails.getSpecialization());
            }
            if (staffDetails.getStatus() != null) {
                // Normalize status when updating
                staff.setStatus(normalizeStatus(staffDetails.getStatus()));
            }

            return staffRepository.save(staff);
        } else {
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