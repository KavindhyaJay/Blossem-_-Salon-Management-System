package com.fullstack.Salonms.service;

import com.fullstack.Salonms.model.Staff;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface StaffService {
    Staff createStaff(Staff staff);
    Staff getStaffById(String id);
    List<Staff> getAllStaff();
    Optional<Staff> getById(String id);
    Staff updateStaff(String id, Staff staff);
    void deleteStaff(String id);

    // NEW AUTH METHODS
    Map<String, Object> loginStaff(String email, String password);
    Staff getStaffByEmail(String email);
}