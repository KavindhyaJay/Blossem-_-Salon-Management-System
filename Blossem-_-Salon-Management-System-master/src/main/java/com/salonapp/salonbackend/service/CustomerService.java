package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Customer;
import com.salonapp.salonbackend.repository.CustomerRepo;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {
    private final CustomerRepo repo;

    public CustomerService(CustomerRepo repo) {
        this.repo = repo;
    }

    public Customer save(Customer customer) {
        return repo.save(customer);
    }
}
