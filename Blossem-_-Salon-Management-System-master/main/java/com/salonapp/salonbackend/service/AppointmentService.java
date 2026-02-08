package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.repository.AppointmentRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepo appointmentRepo;

    public AppointmentService(AppointmentRepo appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    public List<Appointment> getAppointmentsByCustomerEmail(String email) {
        return appointmentRepo.findByCustomerEmail(email);
    }

    public List<Appointment> getAppointmentsByStaffEmail(String email) {
        return appointmentRepo.findByStaffEmail(email);
    }

    public Appointment getAppointmentById(String id) {
        return appointmentRepo.findById(id).orElse(null);
    }

    public List<Appointment> getAppointmentsByPaymentStatus(String status) {
        return appointmentRepo.findByPayment(status);
    }

    public Appointment save(Appointment appointment) {
        return appointmentRepo.save(appointment);
    }
}
