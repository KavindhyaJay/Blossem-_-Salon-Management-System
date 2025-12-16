package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.AppointmentDoc;
import com.salonapp.salonbackend.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin("*")
public class AppointmentApi {

    private final AppointmentService service;

    public AppointmentApi(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    public AppointmentDoc create(@RequestBody AppointmentDoc doc) {
        return service.create(doc);
    }

    @GetMapping
    public List<AppointmentDoc> getAll() {
        return service.getAll();
    }

    @GetMapping("/customer/{email}")
    public List<AppointmentDoc> byEmail(@PathVariable String email) {
        return service.getByEmail(email);
    }
}

