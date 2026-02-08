package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Booking;
import com.salonapp.salonbackend.service.BookingService;
import com.salonapp.salonbackend.security.JwtUtil;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {
    private final BookingService service;
    private final JwtUtil jwtUtil;

    public BookingController(BookingService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/customer/me")
    public List<Booking> getMyBookings(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return service.getBookingsByCustomerEmail(email);
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return service.save(booking);
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable String id) {
        return service.getBookingById(id);
    }
}
