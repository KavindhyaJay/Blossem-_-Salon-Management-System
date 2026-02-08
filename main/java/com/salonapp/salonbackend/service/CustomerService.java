package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Customer;
import com.salonapp.salonbackend.repository.CustomerRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepo repo;

    public CustomerService(CustomerRepo repo) {
        this.repo = repo;
    }

    public List<Customer> getAllCustomers() {
        return repo.findAll();
    }

    public Customer getCustomerByEmail(String email) {
        return repo.findByEmail(email);
    }

    public Customer save(Customer customer) {
        return repo.save(customer); // ✅ using CustomerRepo
    }
}
