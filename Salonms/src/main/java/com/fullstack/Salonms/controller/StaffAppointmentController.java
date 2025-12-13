// File: StaffAppointmentController.java
package com.fullstack.Salonms.controller;

import com.fullstack.Salonms.model.Appointment;
import com.fullstack.Salonms.service.StaffAppointmentService;
import com.fullstack.Salonms.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffAppointmentController {

    @Autowired
    private StaffAppointmentService staffAppointmentService;

    @Autowired
    private StaffService staffService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Get staff profile (their own)
    // In StaffAppointmentController, update any status checks:

    @GetMapping("/me")
    public ResponseEntity<?> getStaffProfile(@RequestAttribute("userId") String staffId) {
        try {
            com.fullstack.Salonms.model.Staff staff = staffService.getStaffById(staffId);

            // Check if staff is active (case-insensitive)
            String status = staff.getStatus();
            if (status != null && status.toLowerCase().contains("inactive")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Account is deactivated. Contact admin.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            staff.setPasswordHash(null);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get today's appointments for logged-in staff
    @GetMapping("/appointments/today")
    public ResponseEntity<?> getTodayAppointments(@RequestAttribute("userId") String staffId) {
        try {
            com.fullstack.Salonms.model.Staff staff = staffService.getStaffById(staffId);
            String staffName = staff.getName();

            List<Appointment> appointments = staffAppointmentService.getTodayAppointmentsForStaff(staffName);

            Map<String, Object> response = new HashMap<>();
            response.put("date", LocalDate.now().format(DATE_FORMATTER));
            response.put("staffName", staffName);
            response.put("appointments", appointments);
            response.put("count", appointments.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get appointments by date (for calendar selection)
    @GetMapping("/appointments/date/{date}")
    public ResponseEntity<?> getAppointmentsByDate(
            @PathVariable String date,
            @RequestAttribute("userId") String staffId) {

        try {
            // Validate date format
            LocalDate.parse(date, DATE_FORMATTER);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid date format. Use yyyy-MM-dd");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            com.fullstack.Salonms.model.Staff staff = staffService.getStaffById(staffId);
            String staffName = staff.getName();

            List<Appointment> appointments = staffAppointmentService.getAppointmentsByDateForStaff(staffName, date);

            Map<String, Object> response = new HashMap<>();
            response.put("date", date);
            response.put("staffName", staffName);
            response.put("appointments", appointments);
            response.put("count", appointments.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Update appointment status
    @PutMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable String appointmentId,
            @RequestBody Map<String, String> request,
            @RequestAttribute("userId") String staffId) {

        try {
            com.fullstack.Salonms.model.Staff staff = staffService.getStaffById(staffId);
            String staffName = staff.getName();
            String status = request.get("status");

            if (status == null || status.isEmpty()) {
                throw new RuntimeException("Status is required");
            }

            Appointment updatedAppointment = staffAppointmentService.updateAppointmentStatus(
                    appointmentId, staffName, status);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment status updated successfully");
            response.put("appointment", updatedAppointment);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}