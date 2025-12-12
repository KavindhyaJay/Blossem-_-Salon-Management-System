// File: AppointmentServiceImpl.java
package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Appointment;
import com.fullstack.Salonms.repository.AppointmentRepository;
import com.fullstack.Salonms.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    public Optional<Appointment> getAppointmentById(String id) {
        return appointmentRepository.findById(id);
    }

    @Override
    public List<Appointment> getAppointmentsByDate(String date) {
        // This is the main method for calendar view
        return appointmentRepository.findByDate(date);
    }
}