package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Appointment> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{bookingId}")
    public Appointment getPaymentByBooking(@PathVariable String bookingId) {
        return service.getPaymentByBookingId(bookingId);
    }

    @GetMapping("/status/{status}")
    public List<Appointment> getPaymentsByStatus(@PathVariable String status) {
        return service.getPaymentsByStatus(status);
    }
}
