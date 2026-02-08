package com.blossem.reception_service.controller;

import com.blossem.reception_service.DTO.BookingRequest;
import com.blossem.reception_service.model.Bookingcustomer;
import com.blossem.reception_service.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingcustomerController {

    private final BookingService service;

    public BookingcustomerController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Bookingcustomer create(@RequestBody BookingRequest req) {
        return service.createFromRequest(req);
    }

    @GetMapping
    public List<Bookingcustomer> list() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public Bookingcustomer getOne(@PathVariable String id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Bookingcustomer update(@PathVariable String id, @RequestBody BookingRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
