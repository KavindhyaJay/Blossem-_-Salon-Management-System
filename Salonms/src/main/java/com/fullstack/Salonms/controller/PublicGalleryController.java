// File: PublicGalleryController.java
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.StaffPhoto;
import com.fullstack.Salonms.service.StaffPhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/gallery")
@CrossOrigin(origins = "*")
public class PublicGalleryController {

    @Autowired
    private StaffPhotoService staffPhotoService;

    // Get approved photos for website (public access)
    @GetMapping
    public ResponseEntity<List<StaffPhoto>> getApprovedPhotos(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "staffName", required = false) String staffName) {

        List<StaffPhoto> approvedPhotos = staffPhotoService.getApprovedPhotos(category);

        // Filter by staff name if provided
        if (staffName != null && !staffName.isEmpty()) {
            approvedPhotos = approvedPhotos.stream()
                    .filter(p -> p.getStaffName().toLowerCase().contains(staffName.toLowerCase()))
                    .toList();
        }

        return ResponseEntity.ok(approvedPhotos);
    }

    // Get photo categories (for filter dropdown)
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<StaffPhoto> approvedPhotos = staffPhotoService.getApprovedPhotos(null);
        List<String> categories = approvedPhotos.stream()
                .map(StaffPhoto::getCategory)
                .distinct()
                .toList();

        return ResponseEntity.ok(categories);
    }

    // Get staff names with approved photos (for filter dropdown)
    @GetMapping("/staff")
    public ResponseEntity<List<String>> getStaffWithPhotos() {
        List<StaffPhoto> approvedPhotos = staffPhotoService.getApprovedPhotos(null);
        List<String> staffNames = approvedPhotos.stream()
                .map(StaffPhoto::getStaffName)
                .distinct()
                .toList();

        return ResponseEntity.ok(staffNames);
    }
}