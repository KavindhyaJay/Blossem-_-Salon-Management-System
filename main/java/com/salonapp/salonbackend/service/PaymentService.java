package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.repository.AppointmentRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaymentService {
    private final AppointmentRepo appointmentRepo;

    public PaymentService(AppointmentRepo appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }

    public List<Appointment> getAllPayments() {
        return appointmentRepo.findAll();
    }

    public Appointment getPaymentByBookingId(String bookingId) {
        return appointmentRepo.findById(bookingId).orElse(null);
    }

    public List<Appointment> getPaymentsByStatus(String status) {
        return appointmentRepo.findAll().stream()
                .filter(a -> a.getPayment().equalsIgnoreCase(status))
                .toList();
    }

    // ✅ Add this save method
    public Appointment save(Appointment appointment) {
        return appointmentRepo.save(appointment);
    }
}
