package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.CustomerDoc;
import com.salonapp.salonbackend.repository.CustomerRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepo repo;

    public CustomerService(CustomerRepo repo) {
        this.repo = repo;
    }

    public CustomerDoc save(CustomerDoc customer) {
        return repo.save(customer);
    }

    public List<CustomerDoc> getAll() {
        return repo.findAll();
    }

    public CustomerDoc getByEmail(String email) {
        return repo.findByEmail(email);
    }


}
