package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Booking;
import com.salonapp.salonbackend.repository.BookingRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaymentService {
    private final BookingRepo bookingRepo;

    public PaymentService(BookingRepo bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    public List<Booking> getAllPayments() {
        return bookingRepo.findAll();
    }

    public Booking getPaymentByBookingId(String bookingId) {
        return bookingRepo.findById(bookingId).orElse(null);
    }

    public List<Booking> getPaymentsByStatus(String status) {
        return bookingRepo.findAll().stream()
                .filter(a -> a.getPayment() != null && a.getPayment().equalsIgnoreCase(status)).toList();
    }

    public Booking save(Booking booking) {
        return bookingRepo.save(booking);
    }
}
