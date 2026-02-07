package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Login;
import com.salonapp.salonbackend.repository.LoginRepo;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
    private final LoginRepo repo;
    public LoginService(LoginRepo repo) { this.repo = repo; }

    public Login login(String username, String password) {
        Login user = repo.findByUsername(username);
        if(user != null && password.equals(user.getPassword())) return user;
        return null;
    }
}
