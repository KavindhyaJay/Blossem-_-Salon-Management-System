package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return service.getAllAppointments();
    }

    @GetMapping("/customer/{email}")
    public List<Appointment> getAppointmentsByCustomer(@PathVariable String email) {
        return service.getAppointmentsByCustomerEmail(email); // <-- match service method
    }

    @GetMapping("/staff/{email}")
    public List<Appointment> getAppointmentsByStaff(@PathVariable String email) {
        return service.getAppointmentsByStaffEmail(email); // <-- match service method
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable String id) {
        return service.getAppointmentById(id);
    }

    @GetMapping("/payment/{status}")
    public List<Appointment> getAppointmentsByPayment(@PathVariable String status) {
        return service.getAppointmentsByPaymentStatus(status);
    }
}
