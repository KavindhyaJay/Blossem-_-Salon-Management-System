// File: AppointmentService.java
package com.fullstack.Salonms.service;

import com.fullstack.Salonms.model.Appointment;
import java.util.List;
import java.util.Optional;

public interface AppointmentService {

    // Get all appointments (optional)
    List<Appointment> getAllAppointments();

    // Get appointment by ID (optional)
    Optional<Appointment> getAppointmentById(String id);

    // MAIN METHOD: Get appointments by specific date for calendar
    List<Appointment> getAppointmentsByDate(String date);
}