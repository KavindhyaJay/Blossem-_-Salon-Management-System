// File: StaffAppointmentService.java
package com.fullstack.Salonms.service;

import com.fullstack.Salonms.model.Appointment;
import java.util.List;

public interface StaffAppointmentService {
    // Get today's appointments for specific staff
    List<Appointment> getTodayAppointmentsForStaff(String staffName);

    // Get appointments by date for specific staff
    List<Appointment> getAppointmentsByDateForStaff(String staffName, String date);

    // Get appointments by date range (for calendar view)
    List<Appointment> getAppointmentsByDateRangeForStaff(String staffName, String startDate, String endDate);

    // Get all appointments for staff
    List<Appointment> getAllAppointmentsForStaff(String staffName);

    // Update appointment status (only for this staff's appointments)
    Appointment updateAppointmentStatus(String appointmentId, String staffName, String status);
}