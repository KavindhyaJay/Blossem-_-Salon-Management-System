// File: AdminServiceImpl.java
package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Admin;
import com.fullstack.Salonms.repository.AdminRepository;
import com.fullstack.Salonms.security.JwtUtil;
import com.fullstack.Salonms.service.AdminService;
import com.fullstack.Salonms.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Admin createAdmin(Admin admin) {
        // Check if admin already exists
        if (adminRepository.count() > 0) {
            Optional<Admin> existingAdmin = adminRepository.findByEmail(admin.getEmail());
            if (existingAdmin.isPresent()) {
                throw new RuntimeException("Admin already exists with this email");
            }
        }

        // Hash password using BCrypt
        String hashedPassword = passwordEncoder.encode(admin.getPasswordHash());
        admin.setPasswordHash(hashedPassword);
        admin.setCreatedAt(new Date());
        admin.setUpdatedAt(new Date());
        admin.setRole("ADMIN");

        return adminRepository.save(admin);
    }

    @Override
    public Map<String, Object> loginAdmin(String email, String password) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        Admin admin = adminOpt.get();

        // Verify password using BCrypt
        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login
        admin.setLastLogin(new Date());
        adminRepository.save(admin);

        // Generate JWT token using JwtUtil (Spring Security + JJWT)
        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("admin", admin);
        response.put("role", admin.getRole());
        response.put("message", "Login successful");

        // Remove password hash from response
        admin.setPasswordHash(null);

        return response;
    }

    @Override
    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    @Override
    public Admin getAdminById(String id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    @Override
    public void changePassword(String adminId, String newPassword) {
        Admin admin = getAdminById(adminId);

        // Hash new password using BCrypt
        String hashedPassword = passwordEncoder.encode(newPassword);
        admin.setPasswordHash(hashedPassword);
        admin.setUpdatedAt(new Date());

        adminRepository.save(admin);
    }

    @Override
    public boolean validateAdminToken(String token) {
        try {
            if (!jwtUtil.validateToken(token)) {
                return false;
            }

            String role = jwtUtil.getRoleFromToken(token);
            return "ADMIN".equals(role);

        } catch (Exception e) {
            return false;
        }
    }
}