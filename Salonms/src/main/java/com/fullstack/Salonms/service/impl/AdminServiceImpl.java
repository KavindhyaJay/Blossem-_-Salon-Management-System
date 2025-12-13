// File: AdminServiceImpl.java (Updated)
package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Admin;
import com.fullstack.Salonms.repository.AdminRepository;
import com.fullstack.Salonms.service.AdminService;
import com.fullstack.Salonms.util.PasswordUtil;
import com.fullstack.Salonms.util.SimpleJwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public Admin createAdmin(Admin admin) {
        if (adminRepository.count() > 0) {
            Optional<Admin> existingAdmin = adminRepository.findByEmail(admin.getEmail());
            if (existingAdmin.isPresent()) {
                throw new RuntimeException("Admin already exists with this email");
            }
        }

        String hashedPassword = PasswordUtil.hashPassword(admin.getPasswordHash());
        admin.setPasswordHash(hashedPassword);
        admin.setCreatedAt(new Date());
        admin.setUpdatedAt(new Date());

        return adminRepository.save(admin);
    }

    @Override
    public Map<String, Object> loginAdmin(String email, String password) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        Admin admin = adminOpt.get();

        if (!PasswordUtil.verifyPassword(password, admin.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        admin.setLastLogin(new Date());
        adminRepository.save(admin);

        // Generate token using SimpleJwtUtil
        String token = SimpleJwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("admin", admin);
        response.put("role", admin.getRole());
        response.put("message", "Login successful");

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
        String hashedPassword = PasswordUtil.hashPassword(newPassword);
        admin.setPasswordHash(hashedPassword);
        admin.setUpdatedAt(new Date());
        adminRepository.save(admin);
    }

    @Override
    public boolean validateAdminToken(String token) {
        try {
            if (!SimpleJwtUtil.validateToken(token)) {
                return false;
            }

            String role = SimpleJwtUtil.extractRole(token);
            return "ADMIN".equals(role);

        } catch (Exception e) {
            return false;
        }
    }
}