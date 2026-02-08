package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Login;
import com.salonapp.salonbackend.service.LoginService;
import com.salonapp.salonbackend.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final LoginService loginService;
    private final JwtUtil jwtUtil;

    public AuthController(LoginService loginService, JwtUtil jwtUtil) {
        this.loginService = loginService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Login user = loginService.login(email, password);
        if (user == null) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return Map.of("token", token);
    }
}

