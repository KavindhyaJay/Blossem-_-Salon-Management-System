package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/auth")
@CrossOrigin(origins = "*")
public class StaffAuthController {

    @Autowired
    private StaffService staffService;

    // Staff login / first-time activation
    @PostMapping("/login")
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                throw new RuntimeException("Email and password are required");
            }

            Map<String, Object> loginResponse = staffService.loginStaff(email, password);

            // Remove password from response
            com.fullstack.Salonms.model.Staff staff = (com.fullstack.Salonms.model.Staff) loginResponse.get("staff");
            staff.setPasswordHash(null);

            return ResponseEntity.ok(loginResponse);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // Forgot password (to implement later)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "If your email exists in our system, you will receive reset instructions");

        return ResponseEntity.ok(response);
    }

    // Debug endpoint to check staff status
    @PostMapping("/check-status")
    public ResponseEntity<?> checkStaffStatus(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email is required");
            }

            com.fullstack.Salonms.model.Staff staff = staffService.getStaffByEmail(email);

            Map<String, Object> details = new HashMap<>();
            details.put("email", staff.getEmail());
            details.put("name", staff.getName());
            details.put("status", staff.getStatus());
            details.put("hasPassword", staff.getPasswordHash() != null);
            details.put("hasActivated", staff.getHasActivated());
            details.put("specialization", staff.getSpecialization());

            // Normalized status
            String normalized = normalizeStatusForDisplay(staff.getStatus());
            details.put("normalizedStatus", normalized);

            return ResponseEntity.ok(details);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    private String normalizeStatusForDisplay(String status) {
        if (status == null) return "null";

        String lower = status.toLowerCase();
        if (lower.contains("pending")) return "Pending";
        if (lower.contains("active")) return "Active";
        if (lower.contains("inactive")) return "Inactive";
        return status;
    }
}