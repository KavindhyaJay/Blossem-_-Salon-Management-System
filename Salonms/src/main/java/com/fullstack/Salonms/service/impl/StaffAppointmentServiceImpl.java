// File: StaffAppointmentServiceImpl.java
package com.fullstack.Salonms.service.impl;

import com.fullstack.Salonms.model.Appointment;
import com.fullstack.Salonms.repository.AppointmentRepository;
import com.fullstack.Salonms.service.StaffAppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffAppointmentServiceImpl implements StaffAppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public List<Appointment> getTodayAppointmentsForStaff(String staffName) {
        String today = LocalDate.now().format(DATE_FORMATTER);
        return getAppointmentsByDateForStaff(staffName, today);
    }

    @Override
    public List<Appointment> getAppointmentsByDateForStaff(String staffName, String date) {
        // Get all appointments for the date
        List<Appointment> appointments = appointmentRepository.findByDate(date);

        // Filter by staff name and sort by time
        return appointments.stream()
                .filter(appointment -> staffName.equals(appointment.getStaff()))
                .sorted(Comparator.comparing(Appointment::getTime))
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> getAppointmentsByDateRangeForStaff(String staffName, String startDate, String endDate) {
        // Get all appointments and filter by date range and staff
        return appointmentRepository.findAll().stream()
                .filter(appointment -> staffName.equals(appointment.getStaff()))
                .filter(appointment -> {
                    String appDate = appointment.getDate();
                    return appDate.compareTo(startDate) >= 0 && appDate.compareTo(endDate) <= 0;
                })
                .sorted(Comparator.comparing(Appointment::getDate).thenComparing(Appointment::getTime))
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> getAllAppointmentsForStaff(String staffName) {
        return appointmentRepository.findAll().stream()
                .filter(appointment -> staffName.equals(appointment.getStaff()))
                .sorted(Comparator.comparing(Appointment::getDate).thenComparing(Appointment::getTime))
                .collect(Collectors.toList());
    }

    @Override
    public Appointment updateAppointmentStatus(String appointmentId, String staffName, String status) {
        Optional<Appointment> optionalAppointment = appointmentRepository.findById(appointmentId);

        if (optionalAppointment.isEmpty()) {
            throw new RuntimeException("Appointment not found");
        }

        Appointment appointment = optionalAppointment.get();

        // Verify the appointment belongs to this staff member
        if (!staffName.equals(appointment.getStaff())) {
            throw new RuntimeException("You are not authorized to update this appointment");
        }

        appointment.setBookingStatus(status);
        appointment.setUpdatedAt(new java.util.Date());

        return appointmentRepository.save(appointment);
    }
}