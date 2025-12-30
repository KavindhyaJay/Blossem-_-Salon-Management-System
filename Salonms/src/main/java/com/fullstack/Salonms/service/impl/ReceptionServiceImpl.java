package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Reception;
import com.fullstack.Salonms.repository.ReceptionRepository;
import com.fullstack.Salonms.util.PasswordUtil;
import com.fullstack.Salonms.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ReceptionServiceImpl {

    @Autowired
    private ReceptionRepository receptionRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public Map<String, Object> loginReception(String email, String password) {
        Optional<Reception> receptionOpt = receptionRepository.findByEmail(email);

        if (receptionOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        Reception reception = receptionOpt.get();
        String currentStatus = reception.getStatus();

        // Normalize status (case-insensitive)
        String normalizedStatus = normalizeStatus(currentStatus);

        // Check if account is INACTIVE
        if ("INACTIVE".equalsIgnoreCase(normalizedStatus) ||
                "DEACTIVATED".equalsIgnoreCase(normalizedStatus)) {
            throw new RuntimeException("Account is deactivated. Contact admin.");
        }

        boolean hasPassword = reception.getPasswordHash() != null;

        if (!hasPassword) {
            // FIRST-TIME LOGIN: No password yet
            boolean canActivate = "PENDING".equalsIgnoreCase(normalizedStatus) ||
                    "PENDING_ACTIVATION".equalsIgnoreCase(normalizedStatus) ||
                    ("ACTIVE".equalsIgnoreCase(normalizedStatus) && !hasPassword);

            if (!canActivate) {
                throw new RuntimeException("Account status '" + currentStatus + "' cannot be activated. Contact admin.");
            }

            // Set password and activate account
            reception.setPasswordHash(PasswordUtil.hashPassword(password));
            reception.setHasActivated(true);
            reception.setStatus("ACTIVE");
            reception.setActivatedAt(new Date());
            reception.setLastLogin(new Date());
            receptionRepository.save(reception);

            return createLoginResponse(reception, true, "Account activated successfully!");

        } else {
            // REGULAR LOGIN: Password exists
            if (!PasswordUtil.verifyPassword(password, reception.getPasswordHash())) {
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

            return createLoginResponse(reception, false, "Login successful");
        }
    }

    private Map<String, Object> createLoginResponse(Reception reception, boolean firstLogin, String message) {
        String token = jwtTokenUtil.generateToken(reception.getId(), reception.getEmail(), "RECEPTION");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("reception", reception);
        response.put("role", "RECEPTION");
        response.put("firstLogin", firstLogin);
        response.put("message", message);

        return response;
    }

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
}