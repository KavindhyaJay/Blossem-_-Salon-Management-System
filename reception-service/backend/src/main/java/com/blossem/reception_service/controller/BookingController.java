package com.blossem.reception_service.controller;

import com.blossem.reception_service.DTO.BookingRequest;
import com.blossem.reception_service.model.Booking;
import com.blossem.reception_service.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking create(@RequestBody BookingRequest req) {
        return service.createFromRequest(req);
    }

    @GetMapping
    public List<Booking> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public Booking getOne(@PathVariable String id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Booking update(@PathVariable String id, @RequestBody BookingRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
