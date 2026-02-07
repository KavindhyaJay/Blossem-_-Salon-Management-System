package com.salonapp.salonbackend.controller;

import com.salonapp.salonbackend.model.Login;
import com.salonapp.salonbackend.service.LoginService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
public class LoginController {
    private final LoginService service;
    public LoginController(LoginService service) { this.service = service; }

    @PostMapping
    public Login login(@RequestParam String username, @RequestParam String password) {
        return service.login(username, password);
    }
}
