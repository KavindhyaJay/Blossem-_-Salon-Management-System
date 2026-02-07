package com.blossem.reception_service.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.blossem.reception_service.DTO.LoginRequest;
import com.blossem.reception_service.DTO.LoginResponse;

@Service
public class ReceptionAuthService {

    private final String allowedEmail;
    private final String allowedPassword;
    private final String displayName;
    private final String role;

    public ReceptionAuthService(
            @Value("${reception.auth.email:reception@blossem.com}") String allowedEmail,
            @Value("${reception.auth.password:welcome123}") String allowedPassword,
            @Value("${reception.auth.user-name:Front Desk Agent}") String displayName,
            @Value("${reception.auth.role:RECEPTIONIST}") String role) {
        this.allowedEmail = allowedEmail;
        this.allowedPassword = allowedPassword;
        this.displayName = displayName;
        this.role = role;
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || !StringUtils.hasText(request.getEmail())
                || !StringUtils.hasText(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        if (!request.getEmail().equalsIgnoreCase(allowedEmail) || !request.getPassword().equals(allowedPassword)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        String token = UUID.randomUUID().toString();
        return new LoginResponse(token, displayName, allowedEmail, role);
    }
}
