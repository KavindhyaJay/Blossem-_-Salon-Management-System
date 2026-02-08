package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Login;
import com.salonapp.salonbackend.service.LoginService;
import com.salonapp.salonbackend.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "http://localhost:3000") // allow React frontend
public class LoginController {

    private final LoginService service;
    private final JwtUtil jwtUtil;

    public LoginController(LoginService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public String login(@RequestParam String username, @RequestParam String password) {
        Login user = service.login(username, password);
        if (user != null) {
            // Use the instance of JwtUtil
            return jwtUtil.generateToken(username);
        }
        throw new RuntimeException("Invalid login");
    }
}
