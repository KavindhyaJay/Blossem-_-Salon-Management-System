package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Booking;
import com.salonapp.salonbackend.repository.BookingRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepo repo;

    public BookingService(BookingRepo repo) {
        this.repo = repo;
    }

    public List<Booking> getAllBookings() {
        return repo.findAll();
    }

    public List<Booking> getBookingsByCustomerEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Booking> getBookingsByStaffEmail(String email) {
        return repo.findByStaffEmail(email);
    }

    public List<Booking> getBookingsByPaymentStatus(String status) {
        return repo.findByPayment(status);
    }

    public Booking getBookingById(String id) {
        return repo.findById(id).orElse(null);
    }

    public Booking save(Booking b) {
        return repo.save(b);
    }
}
