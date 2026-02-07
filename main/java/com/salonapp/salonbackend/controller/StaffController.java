package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Staff;
import com.salonapp.salonbackend.service.StaffService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/staff")
public class StaffController {
    private final StaffService service;
    public StaffController(StaffService service) { this.service = service; }

    @GetMapping
    public List<Staff> getAllStaff() { return service.getAllStaff(); }
}
