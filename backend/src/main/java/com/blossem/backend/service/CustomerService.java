package com.blossem.backend.service;

import com.blossem.backend.model.Customer;
import com.blossem.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public Customer save(Customer c) {
        return customerRepository.save(c);
    }

    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    public Customer getById(String id) {
        return customerRepository.findById(id).orElse(null);
    }

    public void delete(String id) {
        customerRepository.deleteById(id);
    }
}
