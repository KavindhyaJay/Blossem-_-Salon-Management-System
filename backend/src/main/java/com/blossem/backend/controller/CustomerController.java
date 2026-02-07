package com.blossem.backend.controller;

import com.blossem.backend.model.Customer;
import com.blossem.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService service;

    @PostMapping
    public Customer create(@RequestBody Customer c) {
        return service.save(c);
    }

    @GetMapping
    public List<Customer> getAll() {
        return service.getAll();
    }
}
