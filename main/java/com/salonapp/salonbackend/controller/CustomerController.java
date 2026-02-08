package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Appointment;
import com.salonapp.salonbackend.model.Customer;
import com.salonapp.salonbackend.service.CustomerService;
import com.salonapp.salonbackend.service.AppointmentService;
import com.salonapp.salonbackend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    private final CustomerService customerService;
    private final AppointmentService appointmentService;
    private final JwtUtil jwtUtil;

    public CustomerController(CustomerService customerService, AppointmentService appointmentService, JwtUtil jwtUtil) {
        this.customerService = customerService;
        this.appointmentService = appointmentService;
        this.jwtUtil = jwtUtil;
    }

    // -------------------------
    // Get all customers
    // -------------------------
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    // -------------------------
    // Get customer by email
    // -------------------------
    @GetMapping("/{email}")
    public ResponseEntity<Customer> getCustomer(@PathVariable String email) {
        Customer customer = customerService.getCustomerByEmail(email);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(customer);
    }

    // -------------------------
    // JWT-secured endpoint: get logged-in customer's appointments
    // -------------------------
    @GetMapping("/me/appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        List<Appointment> appointments = appointmentService.getAppointmentsByCustomerEmail(email);
        return ResponseEntity.ok(appointments);
    }

    // -------------------------
    // Optional: Create appointment for logged-in customer
    // -------------------------
    @PostMapping("/me/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestHeader("Authorization") String authHeader,
                                                         @RequestBody Appointment appointment) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        appointment.setCustomerEmail(email); // assign the logged-in customer
        Appointment savedAppointment = appointmentService.save(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAppointment);
    }
}
