package com.blossem.reception_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blossem.reception_service.DTO.LoginRequest;
import com.blossem.reception_service.DTO.LoginResponse;
import com.blossem.reception_service.service.ReceptionAuthService;

@RestController
@RequestMapping("/api/reception")
@CrossOrigin
public class ReceptionAuthController {

    private final ReceptionAuthService authService;

    public ReceptionAuthController(ReceptionAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
