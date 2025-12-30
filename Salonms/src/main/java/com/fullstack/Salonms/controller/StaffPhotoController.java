// File: StaffPhotoController.java
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.StaffPhoto;
import com.fullstack.Salonms.service.StaffPhotoService;
import com.fullstack.Salonms.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/photos")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('STAFF')")
public class StaffPhotoController {

    @Autowired
    private StaffPhotoService staffPhotoService;

    @Autowired
    private StaffService staffService;

    // Staff uploads photo
    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", defaultValue = "OTHER") String category,
            @RequestAttribute("userId") String staffId) {

        try {
            // Get staff name from staff service
            com.fullstack.Salonms.model.Staff staff = staffService.getStaffById(staffId);
            String staffName = staff.getName();

            StaffPhoto photo = staffPhotoService.uploadPhoto(
                    staffId, staffName, file, title, description, category);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Photo uploaded successfully! Waiting for admin approval.");
            response.put("photo", photo);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Staff gets their own photos
    @GetMapping("/my-photos")
    public ResponseEntity<?> getMyPhotos(
            @RequestAttribute("userId") String staffId,
            @RequestParam(value = "status", required = false) String status) {

        try {
            List<StaffPhoto> photos;
            if (status != null && !status.isEmpty()) {
                photos = staffPhotoService.getStaffPhotosByStatus(staffId, status);
            } else {
                photos = staffPhotoService.getStaffPhotos(staffId);
            }

            // Add counts summary
            Map<String, Object> response = new HashMap<>();
            response.put("photos", photos);
            response.put("total", photos.size());
            response.put("pending", photos.stream().filter(p -> "PENDING".equals(p.getStatus())).count());
            response.put("approved", photos.stream().filter(p -> "APPROVED".equals(p.getStatus())).count());
            response.put("rejected", photos.stream().filter(p -> "REJECTED".equals(p.getStatus())).count());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Staff deletes their pending photo
    @DeleteMapping("/{photoId}")
    public ResponseEntity<?> deleteMyPhoto(
            @PathVariable String photoId,
            @RequestAttribute("userId") String staffId) {

        try {
            staffPhotoService.deleteStaffPhoto(photoId, staffId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Photo deleted successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}