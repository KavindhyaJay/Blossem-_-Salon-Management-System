package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.CustomerDoc;
import com.salonapp.salonbackend.service.CustomerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin("*")
public class CustomerApi {

    private final CustomerService service;

    public CustomerApi(CustomerService service) {
        this.service = service;
    }

    @PostMapping
    public CustomerDoc create(@RequestBody CustomerDoc customer) {
        return service.save(customer);
    }

    @GetMapping
    public List<CustomerDoc> all() {
        return service.getAll();
    }

    @GetMapping("/by-email")
    public CustomerDoc getByEmail(@RequestParam String email) {
        return service.getByEmail(email);
    }

}

