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

    @PostMapping("/confirm/{id}")
    public Appointment confirmPayment(@PathVariable String id) {
        Appointment a = service.getPaymentByBookingId(id);
        a.setPayment("PAID");
        return service.save(a);
    }

    @PostMapping("/notify")
    public void payhereNotify(@RequestParam String order_id, @RequestParam String status_code) {
        if ("2".equals(status_code)) { // 2 = success in PayHere
            Appointment a = service.getPaymentByBookingId(order_id);
            if (a != null) {
                a.setPayment("PAID");
                service.save(a); // ✅ use service instead of appointmentRepo
            }
        }
    }


}
