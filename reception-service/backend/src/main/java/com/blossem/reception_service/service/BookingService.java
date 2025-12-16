package com.blossem.reception_service.service;

import com.blossem.reception_service.DTO.BookingRequest;
import com.blossem.reception_service.model.Booking;
import com.blossem.reception_service.model.BookingStatus;
import com.blossem.reception_service.model.PaymentStatus;
import com.blossem.reception_service.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final ReceptionService receptionService;

    public BookingService(BookingRepository bookingRepo, ReceptionService receptionService) {
        this.bookingRepo = bookingRepo;
        this.receptionService = receptionService;
    }

    /**
     * Create booking from request.
     * If email is provided, automatically creates a reception appointment as well.
     */
    @Transactional
    public Booking createFromRequest(BookingRequest req) {
        Booking b = new Booking();
        b.setEmail(req.getEmail()); // Save email in booking collection
        b.setCustomerName(req.getCustomerName());
        b.setServices(req.getServices());
        b.setDate(req.getDate());
        b.setTime(req.getTime());
        b.setStaff(req.getStaff());
        b.setPayment(req.getPayment());
        b.setBookingStatus(BookingStatus.CUSTOMER_NOT_ARRIVED);
        // paymentStatus defaults to PENDING
        Booking savedBooking = bookingRepo.save(b);

        // If email is provided, automatically create reception appointment
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            try {
                // Create reception appointment from the newly created booking
                receptionService.createFromExistingBooking(savedBooking.getId(), req.getEmail());
            } catch (Exception e) {
                // Log error but don't fail the booking creation
                System.err.println("Failed to create reception appointment for booking: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return savedBooking;
    }

    public Booking update(String id, BookingRequest req) {
        Booking existing = bookingRepo.findById(id).orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        if (req.getEmail() != null) {
            existing.setEmail(req.getEmail());
        }
        existing.setCustomerName(req.getCustomerName());
        existing.setServices(req.getServices());
        existing.setDate(req.getDate());
        existing.setTime(req.getTime());
        existing.setStaff(req.getStaff());
        existing.setPayment(req.getPayment());
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
}
