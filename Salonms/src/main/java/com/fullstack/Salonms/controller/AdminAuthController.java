// File: AdminAuthController.java (Updated)
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.Admin;
import com.fullstack.Salonms.service.AdminService;
import com.fullstack.Salonms.util.SimpleJwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/init")
    public ResponseEntity<?> initializeAdmin(@RequestBody Admin admin) {
        try {
            Admin createdAdmin = adminService.createAdmin(admin);
            createdAdmin.setPasswordHash(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin created successfully");
            response.put("admin", createdAdmin);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                throw new RuntimeException("Email and password are required");
            }

            Map<String, Object> loginResponse = adminService.loginAdmin(email, password);

            // Remove password from response
            Admin admin = (Admin) loginResponse.get("admin");
            admin.setPasswordHash(null);

            return ResponseEntity.ok(loginResponse);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Invalid authorization header");
            }

            String token = authHeader.substring(7);

            if (!adminService.validateAdminToken(token)) {
                throw new RuntimeException("Invalid or expired token");
            }

            String adminId = SimpleJwtUtil.extractUserId(token);
            String email = SimpleJwtUtil.extractEmail(token);
            String role = SimpleJwtUtil.extractRole(token);

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("adminId", adminId);
            response.put("email", email);
            response.put("role", role);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("valid", "false");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Invalid authorization header");
            }

            String token = authHeader.substring(7);

            if (!adminService.validateAdminToken(token)) {
                throw new RuntimeException("Invalid or expired token");
            }

            String adminId = SimpleJwtUtil.extractUserId(token);
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");

            if (newPassword == null || newPassword.isEmpty()) {
                throw new RuntimeException("New password is required");
            }

            if (!newPassword.equals(confirmPassword)) {
                throw new RuntimeException("Passwords do not match");
            }

            adminService.changePassword(adminId, newPassword);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}