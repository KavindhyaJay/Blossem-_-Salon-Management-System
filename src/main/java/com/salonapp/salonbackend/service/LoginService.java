package com.salonapp.salonbackend.service;

import com.salonapp.salonbackend.model.Login;
import com.salonapp.salonbackend.repository.LoginRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
    private final LoginRepo repo;
    private final PasswordEncoder passwordEncoder;

    public LoginService(LoginRepo repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public Login login(String email, String password) {
        Login user = repo.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword()))
            return user;
        return null;
    }

    public Login save(Login user) {
        return repo.save(user);
    }
}
