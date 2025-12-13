// File: StaffPhotoRepository.java
package com.fullstack.Salonms.repository;

import com.fullstack.Salonms.model.StaffPhoto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffPhotoRepository extends MongoRepository<StaffPhoto, String> {
    // Find staff's own photos
    List<StaffPhoto> findByStaffId(String staffId);

    // Find photos by staff and status
    List<StaffPhoto> findByStaffIdAndStatus(String staffId, String status);

    // Find all pending photos (for admin)
    List<StaffPhoto> findByStatus(String status);

    // Find approved photos for website
    List<StaffPhoto> findByStatusAndCategory(String status, String category);

    // Count pending photos (for admin dashboard)
    long countByStatus(String status);
}