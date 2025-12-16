package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.AppointmentDoc;
import com.salonapp.salonbackend.repository.AppointmentRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepo repo;

    public AppointmentService(AppointmentRepo repo) {
        this.repo = repo;
    }

    public AppointmentDoc create(AppointmentDoc appointment) {
        appointment.setPaymentStatus("PENDING");
        appointment.setBookingStatus("BOOKED");
        return repo.save(appointment);
    }

    public List<AppointmentDoc> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<AppointmentDoc> getAll() {
        return repo.findAll();
    }
}

