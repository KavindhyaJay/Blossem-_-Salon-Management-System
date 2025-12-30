// File: ReceptionAuthController.java (Updated for Spring Security JWT)
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.Reception;
import com.fullstack.Salonms.repository.ReceptionRepository;
import com.fullstack.Salonms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reception/auth")
@CrossOrigin(origins = "*")
public class ReceptionAuthController {

    @Autowired
    private ReceptionRepository receptionRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== RECEPTION LOGIN / FIRST-TIME ACTIVATION ====================
    @PostMapping("/login")
    public ResponseEntity<?> receptionLogin(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                throw new RuntimeException("Email and password are required");
            }

            Optional<Reception> receptionOpt = receptionRepository.findByEmail(email);

            if (receptionOpt.isEmpty()) {
                throw new RuntimeException("Invalid email or password");
            }

            Reception reception = receptionOpt.get();
            String currentStatus = reception.getStatus();

            // Normalize status (case-insensitive)
            String normalizedStatus = normalizeStatus(currentStatus);

            // 1. Check if account is INACTIVE
            if ("INACTIVE".equalsIgnoreCase(normalizedStatus) ||
                    "DEACTIVATED".equalsIgnoreCase(normalizedStatus)) {
                throw new RuntimeException("Account is deactivated. Contact admin.");
            }

            boolean hasPassword = reception.getPasswordHash() != null;

            if (!hasPassword) {
                // FIRST-TIME LOGIN: No password yet (Activation)
                return handleFirstTimeLogin(reception, password, normalizedStatus);
            } else {
                // REGULAR LOGIN: Password exists
                return handleRegularLogin(reception, password, normalizedStatus);
            }

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private ResponseEntity<?> handleFirstTimeLogin(Reception reception, String password, String normalizedStatus) {
        // Allow activation if status is PENDING or ACTIVE but no password
        boolean canActivate = "PENDING".equalsIgnoreCase(normalizedStatus) ||
                "PENDING_ACTIVATION".equalsIgnoreCase(normalizedStatus) ||
                ("ACTIVE".equalsIgnoreCase(normalizedStatus) && reception.getPasswordHash() == null);

        if (!canActivate) {
            throw new RuntimeException("Account status '" + reception.getStatus() + "' cannot be activated. Contact admin.");
        }

        // SET PASSWORD AND ACTIVATE ACCOUNT
        reception.setPasswordHash(passwordEncoder.encode(password)); // Save hashed password
        reception.setHasActivated(true);
        reception.setStatus("ACTIVE"); // Change to ACTIVE
        reception.setActivatedAt(new Date());
        reception.setLastLogin(new Date());
        receptionRepository.save(reception);

        String token = jwtUtil.generateToken(reception.getId(), reception.getEmail(), "RECEPTION");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("reception", reception);
        response.put("role", "RECEPTION");
        response.put("firstLogin", true);
        response.put("message", "Account activated successfully!");

        // Remove password from response
        reception.setPasswordHash(null);

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<?> handleRegularLogin(Reception reception, String password, String normalizedStatus) {
        // Verify password
        if (!passwordEncoder.matches(password, reception.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Check if account is active
        if ("INACTIVE".equalsIgnoreCase(normalizedStatus) ||
                "DEACTIVATED".equalsIgnoreCase(normalizedStatus)) {
            throw new RuntimeException("Account is deactivated. Contact admin.");
        }

        // Update status to Active if it was Pending
        if ("PENDING".equalsIgnoreCase(normalizedStatus) ||
                "PENDING_ACTIVATION".equalsIgnoreCase(normalizedStatus)) {
            reception.setStatus("ACTIVE");
        }

        // Update last login
        reception.setLastLogin(new Date());
        receptionRepository.save(reception);

        String token = jwtUtil.generateToken(reception.getId(), reception.getEmail(), "RECEPTION");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("reception", reception);
        response.put("role", "RECEPTION");
        response.put("firstLogin", false);
        response.put("message", "Login successful");

        // Remove password from response
        reception.setPasswordHash(null);

        return ResponseEntity.ok(response);
    }

    // ==================== CHECK RECEPTION STATUS ====================
    @PostMapping("/check-status")
    public ResponseEntity<?> checkReceptionStatus(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email is required");
            }

            Reception reception = receptionRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Reception account not found"));

            Map<String, Object> details = new HashMap<>();
            details.put("email", reception.getEmail());
            details.put("name", reception.getName());
            details.put("phone", reception.getPhone());
            details.put("shift", reception.getShift());
            details.put("status", reception.getStatus());
            details.put("hasPassword", reception.getPasswordHash() != null);
            details.put("hasActivated", reception.getHasActivated());

            // Normalized status for display
            details.put("normalizedStatus", normalizeStatusForDisplay(reception.getStatus()));

            return ResponseEntity.ok(details);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ==================== HELPER METHODS ====================
    private String normalizeStatus(String status) {
        if (status == null || status.isEmpty()) {
            return "PENDING";
        }

        String lowerStatus = status.trim().toLowerCase();

        if (lowerStatus.contains("pending") || lowerStatus.contains("activation")) {
            return "PENDING";
        } else if (lowerStatus.contains("active")) {
            return "ACTIVE";
        } else if (lowerStatus.contains("inactive") || lowerStatus.contains("deactivated")) {
            return "INACTIVE";
        }

        return status;
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