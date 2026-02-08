package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.Admin;
import com.fullstack.Salonms.service.AdminService;
import com.fullstack.Salonms.security.JwtUtil;  // Import JWT utility class
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Admin Authentication operations
 * Handles admin registration, login, token validation, and password management
 */
@RestController
@RequestMapping("/api/admin/auth") // Base path for all admin authentication endpoints
@CrossOrigin(origins = "*") // Allow requests from any origin
public class AdminAuthController {

    @Autowired
    private AdminService adminService; // Service layer for admin business logic

    @Autowired
    private JwtUtil jwtUtil;  // JWT utility for token operations

    /**
     * Initialize/register a new admin user
     *
     * @param admin Admin object with registration details
     * @return ResponseEntity with success message and admin details
     */
    @PostMapping("/init")
    public ResponseEntity<?> initializeAdmin(@RequestBody Admin admin) {
        try {
            // Create admin using service layer
            Admin createdAdmin = adminService.createAdmin(admin);
            createdAdmin.setPasswordHash(null); // Remove password hash from response for security

            // Build success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin created successfully");
            response.put("admin", createdAdmin);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Handle registration errors
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Authenticate admin and generate JWT token
     *
     * @param credentials Map containing email and password
     * @return ResponseEntity with token and admin details
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        try {
            // Extract credentials from request
            String email = credentials.get("email");
            String password = credentials.get("password");

            // Validate required fields
            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                throw new RuntimeException("Email and password are required");
            }

            // Authenticate using service layer
            Map<String, Object> loginResponse = adminService.loginAdmin(email, password);

            // Remove password hash from response for security
            Admin admin = (Admin) loginResponse.get("admin");
            admin.setPasswordHash(null);

            return ResponseEntity.ok(loginResponse);

        } catch (RuntimeException e) {
            // Handle authentication failures
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Validate JWT token and extract user information
     *
     * @param authHeader Authorization header containing Bearer token
     * @return ResponseEntity with token validity and user claims
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate authorization header format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Invalid authorization header");
            }

            // Extract token from header
            String token = authHeader.substring(7);

            // Validate token using service
            if (!adminService.validateAdminToken(token)) {
                throw new RuntimeException("Invalid or expired token");
            }

            // Extract claims from token using JwtUtil
            String adminId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);

            // Build validation response
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("adminId", adminId);
            response.put("email", email);
            response.put("role", role);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Handle invalid token
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("valid", "false");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Change admin password (requires valid token)
     *
     * @param authHeader Authorization header containing Bearer token
     * @param request Map containing newPassword and confirmPassword
     * @return ResponseEntity with success/error message
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        try {
            // Validate authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Invalid authorization header");
            }

            // Extract and validate token
            String token = authHeader.substring(7);
            if (!adminService.validateAdminToken(token)) {
                throw new RuntimeException("Invalid or expired token");
            }

            // Extract admin ID from token
            String adminId = jwtUtil.extractUserId(token);

            // Get password details from request
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");

            // Validate password inputs
            if (newPassword == null || newPassword.isEmpty()) {
                throw new RuntimeException("New password is required");
            }

            if (!newPassword.equals(confirmPassword)) {
                throw new RuntimeException("Passwords do not match");
            }

            // Update password using service
            adminService.changePassword(adminId, newPassword);

            // Build success response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Handle password change errors
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}