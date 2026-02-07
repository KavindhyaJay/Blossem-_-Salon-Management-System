package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Customer;
import com.salonapp.salonbackend.service.CustomerService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {
    private final CustomerService service;
    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping
    public List<Customer> getAllCustomers() { return service.getAllCustomers(); }

    @GetMapping("/{email}")
    public Customer getCustomer(@PathVariable String email) { return service.getCustomerByEmail(email); }
}
