package com.fullstack.Salonms.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        System.out.println("=== DEBUG: /api/test/ping called ===");
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Server is running");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }

    @PostMapping("/echo")
    public Map<String, Object> echo(@RequestBody Map<String, Object> request) {
        System.out.println("=== DEBUG: /api/test/echo called ===");
        System.out.println("Request: " + request);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("received", request);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/error-test")
    public Map<String, String> errorTest() {
        System.out.println("=== DEBUG: /api/test/error-test called ===");
        throw new RuntimeException("This is a test error");
    }
}