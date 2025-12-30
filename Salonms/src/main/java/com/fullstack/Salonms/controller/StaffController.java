package com.fullstack.Salonms.controller;
import java.util.List;
import java.util.Optional;

import com.fullstack.Salonms.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fullstack.Salonms.model.Staff;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {
    @Autowired
    private StaffService staffService;

    @GetMapping
    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable String id) {
        Optional<Staff> staff = staffService.getById(id);
        return staff.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Staff> createStaff(@RequestBody Staff staff) {
        try {
            // ⭐ Set role if not provided
            if (staff.getRole() == null || staff.getRole().isEmpty()) {
                staff.setRole("STAFF");
            }

            Staff createdStaff = staffService.createStaff(staff);
            return ResponseEntity.ok(createdStaff);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable String id, @RequestBody Staff staff) {
        // ⭐ Ensure role is preserved when updating
        Staff existingStaff = staffService.getById(id).orElse(null);
        if (existingStaff != null && staff.getRole() == null) {
            staff.setRole(existingStaff.getRole()); // Keep existing role
        }

        Staff updated = staffService.updateStaff(id, staff);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}