package com.blossem.backend.controller;

import com.blossem.backend.model.Booking;
import com.blossem.backend.model.BookingRequest;
import com.blossem.backend.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/create")
    public Booking createFullBooking(@RequestBody BookingRequest request) {
        return bookingService.processBooking(request);
    }
}
