package com.blossem.backend.controller;

import com.blossem.backend.model.Login;
import com.blossem.backend.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "*")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping
    public Login create(@RequestBody Login login) {
        return loginService.save(login);
    }
}
