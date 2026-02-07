package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.repository.AppointmentRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepo repo;

    public AppointmentService(AppointmentRepo repo) {
        this.repo = repo;
    }

    public List<Appointment> getAllAppointments() {
        return repo.findAll();
    }

    public Appointment getAppointmentById(String id) {
        return repo.findById(id).orElse(null);
    }

    public List<Appointment> getAppointmentsByCustomerEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Appointment> getAppointmentsByStaffEmail(String staffEmail) {
        return repo.findByStaffEmail(staffEmail);
    }

    public List<Appointment> getAppointmentsByPaymentStatus(String status) {
        return repo.findByPayment(status);
    }
}
