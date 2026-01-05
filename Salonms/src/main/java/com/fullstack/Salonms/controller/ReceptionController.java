// File: ReceptionController.java 
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.Reception;
import com.fullstack.Salonms.repository.ReceptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reception")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class ReceptionController {

    @Autowired
    private ReceptionRepository receptionRepository;

    // GET ALL RECEPTION (Admin only)
    @GetMapping
    public List<Reception> getAllReception() {
        return receptionRepository.findAll();
    }

    // GET RECEPTION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Reception> getReceptionById(@PathVariable String id) {
        Optional<Reception> reception = receptionRepository.findById(id);
        return reception.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE NEW RECEPTION (Admin only)
    @PostMapping
    public Reception createReception(@RequestBody Reception reception) {
        // Set default status if not provided
        if (reception.getStatus() == null || reception.getStatus().isEmpty()) {
            reception.setStatus("PENDING"); // Needs activation
        } else {
            // Normalize status
            reception.setStatus(normalizeStatus(reception.getStatus()));
        }

        // Ensure auth fields are null for new reception
        reception.setPasswordHash(null); // No password initially
        reception.setHasActivated(false);
        reception.setActivatedAt(null);
        reception.setLastLogin(null);

        return receptionRepository.save(reception);
    }

    // UPDATE RECEPTION (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<Reception> updateReception(@PathVariable String id, @RequestBody Reception receptionDetails) {
        Optional<Reception> optionalReception = receptionRepository.findById(id);

        if (optionalReception.isPresent()) {
            Reception reception = optionalReception.get();

            if (receptionDetails.getName() != null) {
                reception.setName(receptionDetails.getName());
            }
            if (receptionDetails.getEmail() != null) {
                reception.setEmail(receptionDetails.getEmail());
            }
            if (receptionDetails.getPhone() != null) {
                reception.setPhone(receptionDetails.getPhone());
            }
            if (receptionDetails.getShift() != null) {
                reception.setShift(receptionDetails.getShift());
            }
            if (receptionDetails.getStatus() != null) {
                // Normalize status when updating
                reception.setStatus(normalizeStatus(receptionDetails.getStatus()));
            }

            return ResponseEntity.ok(receptionRepository.save(reception));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE RECEPTION (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReception(@PathVariable String id) {
        if (receptionRepository.existsById(id)) {
            receptionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isEmpty()) {
            return "Pending";
        }

        String lowerStatus = status.trim().toLowerCase();

        if (lowerStatus.contains("pending") || lowerStatus.contains("activation")) {
            return "Pending";
        } else if (lowerStatus.contains("active")) {
            return "Active";
        } else if (lowerStatus.contains("inactive") || lowerStatus.contains("deactivated")) {
            return "Inactive";
        }

        return status;
    }
}