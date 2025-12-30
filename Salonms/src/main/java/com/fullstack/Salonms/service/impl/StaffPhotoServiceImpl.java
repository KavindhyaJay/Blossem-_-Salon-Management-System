// File: StaffPhotoServiceImpl.java (No changes needed)
package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.StaffPhoto;
import com.fullstack.Salonms.repository.StaffPhotoRepository;
import com.fullstack.Salonms.service.StaffPhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffPhotoServiceImpl implements StaffPhotoService {

    @Autowired
    private StaffPhotoRepository staffPhotoRepository;

    @Value("${file.upload-dir:uploads/photos}")
    private String uploadDir;

    @Override
    public StaffPhoto uploadPhoto(String staffId, String staffName, MultipartFile file,
                                  String title, String description, String category) {
        try {
            System.out.println("=== DEBUG: Starting upload ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("Content type: " + file.getContentType());
            System.out.println("File size: " + file.getSize() + " bytes");

            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            // Check file type - ACCEPT ANY IMAGE
            String contentType = file.getContentType();
            if (contentType == null) {
                System.out.println("DEBUG: Content type is null, checking extension...");

                // Check by file extension if content type is null
                String filename = file.getOriginalFilename();
                if (filename != null) {
                    String ext = filename.toLowerCase();
                    if (ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") ||
                            ext.endsWith(".gif") || ext.endsWith(".jfif") || ext.endsWith(".bmp") ||
                            ext.endsWith(".webp") || ext.endsWith(".svg")) {
                        System.out.println("DEBUG: Accepting file by extension: " + ext);
                    } else {
                        throw new RuntimeException("File type not recognized. Please use image files (JPG, PNG, GIF, JFIF, BMP, WEBP, SVG)");
                    }
                } else {
                    throw new RuntimeException("File type not recognized");
                }
            }
            // Accept ANY image type
            else if (!contentType.startsWith("image/")) {
                System.out.println("DEBUG: Content type is NOT image: " + contentType);

                // Double-check by filename extension
                String filename = file.getOriginalFilename();
                if (filename != null) {
                    String ext = filename.toLowerCase();
                    if (ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") ||
                            ext.endsWith(".gif") || ext.endsWith(".jfif")) {
                        System.out.println("DEBUG: Accepting anyway by extension: " + ext);
                    } else {
                        throw new RuntimeException("Only image files are allowed. Got content type: " + contentType);
                    }
                } else {
                    throw new RuntimeException("Only image files are allowed. Got content type: " + contentType);
                }
            } else {
                System.out.println("DEBUG: Content type is image: " + contentType + " - ACCEPTED");
            }

            // Check file size (max 10MB - increased from 5MB)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                throw new RuntimeException("File size must be less than 10MB. Your file: " +
                        (file.getSize() / 1024 / 1024) + "MB");
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                System.out.println("DEBUG: Creating upload directory: " + uploadPath.toAbsolutePath());
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                // Default to .jpg if no extension
                fileExtension = ".jpg";
            }

            // Clean filename (remove special characters)
            String cleanFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(cleanFilename);

            System.out.println("DEBUG: Saving to: " + filePath.toAbsolutePath());

            // Save file
            Files.copy(file.getInputStream(), filePath);
            System.out.println("DEBUG: File saved successfully");

            // Create photo record
            StaffPhoto photo = new StaffPhoto();
            photo.setId(UUID.randomUUID().toString());
            photo.setStaffId(staffId);
            photo.setStaffName(staffName);
            photo.setTitle(title != null ? title : "Untitled");
            photo.setDescription(description);
            photo.setCategory(category != null ? category : "OTHER");
            photo.setImageUrl("/uploads/photos/" + cleanFilename);
            photo.setFileName(originalFilename);
            photo.setFileType(contentType != null ? contentType : "image/jpeg"); // Default
            photo.setFileSize(file.getSize());
            photo.setStatus("PENDING"); // Default status
            photo.setUploadedAt(new Date());

            StaffPhoto savedPhoto = staffPhotoRepository.save(photo);
            System.out.println("DEBUG: Photo saved to database with ID: " + savedPhoto.getId());

            return savedPhoto;

        } catch (IOException e) {
            System.err.println("ERROR in uploadPhoto: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public List<StaffPhoto> getStaffPhotos(String staffId) {
        return staffPhotoRepository.findByStaffId(staffId);
    }

    @Override
    public List<StaffPhoto> getStaffPhotosByStatus(String staffId, String status) {
        return staffPhotoRepository.findByStaffIdAndStatus(staffId, status);
    }

    @Override
    public void deleteStaffPhoto(String photoId, String staffId) {
        StaffPhoto photo = staffPhotoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found"));

        // Check ownership
        if (!photo.getStaffId().equals(staffId)) {
            throw new RuntimeException("You can only delete your own photos");
        }

        // Only allow deletion of PENDING photos
        if (!"PENDING".equals(photo.getStatus())) {
            throw new RuntimeException("You can only delete pending photos");
        }

        // Delete file from storage
        try {
            String filename = photo.getImageUrl().substring(photo.getImageUrl().lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, filename);
            Files.deleteIfExists(filePath);
            System.out.println("Deleted file: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            // Log error but continue with database deletion
            System.err.println("Failed to delete file: " + e.getMessage());
        }

        // Delete from database
        staffPhotoRepository.deleteById(photoId);
    }

    @Override
    public StaffPhoto reviewPhoto(String photoId, boolean approve, String rejectionReason, String adminEmail) {
        StaffPhoto photo = staffPhotoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found"));

        if (approve) {
            photo.setStatus("APPROVED");
            photo.setRejectionReason(null);
        } else {
            photo.setStatus("REJECTED");
            photo.setRejectionReason(rejectionReason);
        }

        photo.setReviewedAt(new Date());
        photo.setReviewedBy(adminEmail);

        return staffPhotoRepository.save(photo);
    }

    @Override
    public List<StaffPhoto> getAllPhotos(String status, String staffId, String category) {
        List<StaffPhoto> allPhotos = staffPhotoRepository.findAll();

        // Apply filters
        if (status != null && !status.isEmpty()) {
            allPhotos = allPhotos.stream()
                    .filter(p -> p.getStatus().equals(status))
                    .collect(Collectors.toList());
        }

        if (staffId != null && !staffId.isEmpty()) {
            allPhotos = allPhotos.stream()
                    .filter(p -> p.getStaffId().equals(staffId))
                    .collect(Collectors.toList());
        }

        if (category != null && !category.isEmpty()) {
            allPhotos = allPhotos.stream()
                    .filter(p -> p.getCategory().equals(category))
                    .collect(Collectors.toList());
        }

        return allPhotos;
    }

    @Override
    public List<StaffPhoto> getApprovedPhotos(String category) {
        List<StaffPhoto> allPhotos = staffPhotoRepository.findAll();

        return allPhotos.stream()
                .filter(p -> "APPROVED".equals(p.getStatus()))
                .filter(p -> category == null || category.isEmpty() || p.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    @Override
    public StaffPhoto getPhotoById(String id) {
        return staffPhotoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Photo not found"));
    }

    @Override
    public Map<String, Object> getPhotoStats() {
        List<StaffPhoto> allPhotos = staffPhotoRepository.findAll();

        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        stats.put("total", allPhotos.size());
        stats.put("pending", staffPhotoRepository.countByStatus("PENDING"));
        stats.put("approved", allPhotos.stream().filter(p -> "APPROVED".equals(p.getStatus())).count());
        stats.put("rejected", allPhotos.stream().filter(p -> "REJECTED".equals(p.getStatus())).count());

        // Count by staff
        Map<String, Integer> byStaff = new HashMap<>();
        for (StaffPhoto photo : allPhotos) {
            String staffName = photo.getStaffName();
            byStaff.put(staffName, byStaff.getOrDefault(staffName, 0) + 1);
        }
        stats.put("byStaff", byStaff);

        // Count by staff status
        Map<String, Map<String, Long>> staffStatusCount = new HashMap<>();
        for (StaffPhoto photo : allPhotos) {
            String staffName = photo.getStaffName();
            String status = photo.getStatus();

            staffStatusCount.putIfAbsent(staffName, new HashMap<>());
            Map<String, Long> staffMap = staffStatusCount.get(staffName);
            staffMap.put(status, staffMap.getOrDefault(status, 0L) + 1);
        }
        stats.put("staffStatusCount", staffStatusCount);

        // Count by category
        Map<String, Integer> byCategory = new HashMap<>();
        for (StaffPhoto photo : allPhotos) {
            String category = photo.getCategory();
            byCategory.put(category, byCategory.getOrDefault(category, 0) + 1);
        }
        stats.put("byCategory", byCategory);

        return stats;
    }
}