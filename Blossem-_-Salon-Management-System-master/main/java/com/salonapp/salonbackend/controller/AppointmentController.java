package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.service.AppointmentService;
import com.salonapp.salonbackend.security.JwtUtil;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService service;
    private final JwtUtil jwtUtil;

    public AppointmentController(AppointmentService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return service.getAllAppointments();
    }

    @GetMapping("/customer/{email}")
    public List<Appointment> getAppointmentsByCustomer(@PathVariable String email) {
        return service.getAppointmentsByCustomerEmail(email);
    }

    @GetMapping("/staff/{email}")
    public List<Appointment> getAppointmentsByStaff(@PathVariable String email) {
        return service.getAppointmentsByStaffEmail(email);
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable String id) {
        return service.getAppointmentById(id);
    }

    @GetMapping("/payment/{status}")
    public List<Appointment> getAppointmentsByPayment(@PathVariable String status) {
        return service.getAppointmentsByPaymentStatus(status);
    }

    @GetMapping("/customer/me")
    public List<Appointment> getMyAppointments(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token); // ✅ using injected JwtUtil
        return service.getAppointmentsByCustomerEmail(email);
    }
}
