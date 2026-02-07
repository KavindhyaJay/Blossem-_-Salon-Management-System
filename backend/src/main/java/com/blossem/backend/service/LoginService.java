package com.blossem.backend.service;

import com.blossem.backend.model.Login;
import com.blossem.backend.repository.LoginRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final LoginRepository loginRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public LoginService(LoginRepository loginRepository,
                        BCryptPasswordEncoder passwordEncoder) {
        this.loginRepository = loginRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Login save(Login login) {
        // 🔐 HASH PASSWORD
        login.setPassword(passwordEncoder.encode(login.getPassword()));
        return loginRepository.save(login);
    }

    public Login findByUsername(String username) {
        return loginRepository.findByUsername(username).orElse(null);
    }
}
