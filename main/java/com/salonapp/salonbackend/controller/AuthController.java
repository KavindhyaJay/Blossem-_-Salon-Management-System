package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Customer;
import com.salonapp.salonbackend.model.Login;
import com.salonapp.salonbackend.service.CustomerService;
import com.salonapp.salonbackend.service.LoginService;
import com.salonapp.salonbackend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final LoginService loginService;
    private final CustomerService customerService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(LoginService loginService, CustomerService customerService, JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder) {
        this.loginService = loginService;
        this.customerService = customerService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/health")
    public String health() {
        return "Backend is UP";
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

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");

        // Save to Login collection
        Login loginUser = new Login();
        loginUser.setEmail(email);
        loginUser.setPassword(passwordEncoder.encode(password)); // ✅ Hash the password
        loginUser.setUsername(email); // Use email as username
        loginService.save(loginUser);

        // Save to Customer collection
        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setName(name);
        customerService.save(customer);

        String token = jwtUtil.generateToken(email);
        return Map.of("token", token);
    }
}
