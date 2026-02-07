package com.blossem.reception_service.service;

import com.blossem.reception_service.DTO.BookingRequest;
import com.blossem.reception_service.model.Booking;
import com.blossem.reception_service.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final ReceptionService receptionService;
    private final StaffDirectoryService staffDirectory;

    public BookingService(BookingRepository bookingRepo,
            ReceptionService receptionService,
            StaffDirectoryService staffDirectory) {
        this.bookingRepo = bookingRepo;
        this.receptionService = receptionService;
        this.staffDirectory = staffDirectory;
    }

    /**
     * Create booking from request.
     * If email is provided, automatically creates a reception appointment as well.
     */
    @Transactional
    public Booking createFromRequest(BookingRequest req) {
        Booking b = new Booking();
        b.setEmail(req.getEmail()); // Save email in booking collection
        b.setServices(req.getServices());
        b.setDate(req.getDate());
        b.setTime(req.getTime());
        b.setStaff(req.getStaff());
        b.setStaffEmail(resolveStaffEmail(req.getStaff(), req.getStaffEmail(), null));
        b.setPaymentStatus(resolvePaymentStatus(req.getPaymentStatus(), "Pending"));
        b.setTotalPayment(req.getTotalPayment());
        Booking savedBooking = bookingRepo.save(b);

        // Always mirror the booking in reception appointments so the two collections
        // stay
        // in sync. Let any failure propagate so we don't end up with mismatched data.
        receptionService.createFromExistingBooking(savedBooking.getId(), req.getEmail(), req.getCustomerName());

        return savedBooking;
    }

    public Booking update(String id, BookingRequest req) {
        Booking existing = bookingRepo.findById(id).orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        if (req.getEmail() != null) {
            existing.setEmail(req.getEmail());
        }
        existing.setServices(req.getServices());
        existing.setDate(req.getDate());
        existing.setTime(req.getTime());
        existing.setStaff(req.getStaff());
        existing.setStaffEmail(resolveStaffEmail(req.getStaff(), req.getStaffEmail(), existing.getStaffEmail()));
        String normalizedPaymentStatus = resolvePaymentStatus(req.getPaymentStatus(), null);
        if (normalizedPaymentStatus != null) {
            existing.setPaymentStatus(normalizedPaymentStatus);
        }
        existing.setTotalPayment(req.getTotalPayment());
        return bookingRepo.save(existing);
    }

    public void delete(String id) {
        bookingRepo.deleteById(id);
    }

    public List<Booking> listAll() {
        return bookingRepo.findAll();
    }

    public Booking getById(String id) {
        return bookingRepo.findById(id).orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    private String resolvePaymentStatus(String rawValue, String fallbackIfBlank) {
        String normalized = normalizePaymentValue(rawValue);
        if (normalized != null) {
            return normalized;
        }
        return fallbackIfBlank;
    }

    private String resolveStaffEmail(String staffName, String explicitEmail, String fallback) {
        if (explicitEmail != null && !explicitEmail.isBlank()) {
            return explicitEmail.trim();
        }
        if (staffName != null && !staffName.isBlank()) {
            return staffDirectory.findEmailByName(staffName.trim()).orElse(fallback);
        }
        return fallback;
    }

    private String normalizePaymentValue(String paymentValue) {
        if (paymentValue == null) {
            return null;
        }
        String trimmed = paymentValue.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.equalsIgnoreCase("PAID")) {
            return "Paid";
        }
        if (trimmed.equalsIgnoreCase("PENDING")) {
            return "Pending";
        }
        return trimmed;
    }
}
