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

    @GetMapping("/customer/me")
    public List<Appointment> getMyAppointments(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return service.getAppointmentsByCustomerEmail(email);
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable String id) {
        return service.getAppointmentById(id);
    }
}
