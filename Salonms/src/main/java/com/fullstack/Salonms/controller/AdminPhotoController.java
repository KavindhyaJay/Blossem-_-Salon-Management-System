// File: AdminPhotoController.java
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.StaffPhoto;
import com.fullstack.Salonms.repository.StaffPhotoRepository;
import com.fullstack.Salonms.service.StaffPhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/photos")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPhotoController {

    @Autowired
    private StaffPhotoService staffPhotoService;

    @Autowired
    private StaffPhotoRepository staffPhotoRepository;  

    // Admin gets all photos (with filters)
    @GetMapping
    public ResponseEntity<?> getAllPhotos(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "staffId", required = false) String staffId,
            @RequestParam(value = "category", required = false) String category) {

        try {
            List<StaffPhoto> photos = staffPhotoService.getAllPhotos(status, staffId, category);
            return ResponseEntity.ok(photos);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Admin approves/rejects photo
    @PutMapping("/{photoId}/review")
    public ResponseEntity<?> reviewPhoto(
            @PathVariable String photoId,
            @RequestBody Map<String, Object> request,
            @RequestAttribute("email") String adminEmail) {

        try {
            boolean approve = Boolean.parseBoolean(request.get("approve").toString());
            String rejectionReason = (String) request.get("rejectionReason");

            StaffPhoto updatedPhoto = staffPhotoService.reviewPhoto(
                    photoId, approve, rejectionReason, adminEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("message", approve ? "Photo approved successfully" : "Photo rejected");
            response.put("photo", updatedPhoto);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Admin gets photo by ID
    @GetMapping("/{photoId}")
    public ResponseEntity<?> getPhotoById(@PathVariable String photoId) {
        try {
            StaffPhoto photo = staffPhotoService.getPhotoById(photoId);
            return ResponseEntity.ok(photo);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Admin gets photo stats for dashboard
    @GetMapping("/stats")
    public ResponseEntity<?> getPhotoStats() {
        try {
            Map<String, Object> stats = staffPhotoService.getPhotoStats();
            return ResponseEntity.ok(stats);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Batch approve/reject
    @PostMapping("/batch-review")
    public ResponseEntity<?> batchReviewPhotos(
            @RequestBody Map<String, Object> request,
            @RequestAttribute("email") String adminEmail) {

        try {
            @SuppressWarnings("unchecked")
            List<String> photoIds = (List<String>) request.get("photoIds");
            boolean approve = Boolean.parseBoolean(request.get("approve").toString());
            String rejectionReason = (String) request.get("rejectionReason");

            Map<String, Object> results = new HashMap<>();
            int successCount = 0;
            int failCount = 0;
            List<String> failedIds = new java.util.ArrayList<>();

            for (String photoId : photoIds) {
                try {
                    staffPhotoService.reviewPhoto(photoId, approve, rejectionReason, adminEmail);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    failedIds.add(photoId + ": " + e.getMessage());
                }
            }

            results.put("successCount", successCount);
            results.put("failCount", failCount);
            results.put("failedIds", failedIds);
            results.put("message", "Processed " + successCount + " photos successfully");

            return ResponseEntity.ok(results);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get pending photos count (for admin dashboard badge)
    @GetMapping("/pending-count")
    public ResponseEntity<?> getPendingCount() {
        try {
            // FIXED staffPhotoRepository 
            long pendingCount = staffPhotoRepository.countByStatus("PENDING");
            Map<String, Long> response = new HashMap<>();
            response.put("pendingCount", pendingCount);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Alternative: Get pending count using service (if you prefer)
    @GetMapping("/pending-count-via-service")
    public ResponseEntity<?> getPendingCountViaService() {
        try {
            Map<String, Object> stats = staffPhotoService.getPhotoStats();
            long pendingCount = (long) stats.get("pending");

            Map<String, Long> response = new HashMap<>();
            response.put("pendingCount", pendingCount);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}