// File: AdminService.java
package com.fullstack.Salonms.service;

import com.fullstack.Salonms.model.Admin;

import java.util.Map;

public interface AdminService {
    Admin createAdmin(Admin admin);
    Map<String, Object> loginAdmin(String email, String password);
    Admin getAdminByEmail(String email);
    Admin getAdminById(String id);
    void changePassword(String adminId, String newPassword);
    boolean validateAdminToken(String token);
}