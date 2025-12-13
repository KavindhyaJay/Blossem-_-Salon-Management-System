// File: StaffPhotoService.java
package com.fullstack.Salonms.service;

import com.fullstack.Salonms.model.StaffPhoto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface StaffPhotoService {
    // Staff uploads photo
    StaffPhoto uploadPhoto(String staffId, String staffName, MultipartFile file,
                           String title, String description, String category);

    // Get staff's own photos
    List<StaffPhoto> getStaffPhotos(String staffId);

    // Get staff's photos by status
    List<StaffPhoto> getStaffPhotosByStatus(String staffId, String status);

    // Staff deletes their own pending photo
    void deleteStaffPhoto(String photoId, String staffId);

    // Admin approves/rejects photo
    StaffPhoto reviewPhoto(String photoId, boolean approve, String rejectionReason, String adminEmail);

    // Get all photos for admin (with optional filters)
    List<StaffPhoto> getAllPhotos(String status, String staffId, String category);

    // Get approved photos for website
    List<StaffPhoto> getApprovedPhotos(String category);

    // Get photo by ID
    StaffPhoto getPhotoById(String id);

    // ✅ FIXED: Returns Map instead of PhotoStats class
    Map<String, Object> getPhotoStats();
}