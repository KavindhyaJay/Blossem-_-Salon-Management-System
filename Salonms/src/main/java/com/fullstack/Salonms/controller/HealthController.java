package com.fullstack.Salonms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public Map<String, Object> healthCheck() {
        System.out.println("=== DEBUG: Health endpoint called ===");

        // SIMPLE TEST - Remove MongoDB check temporarily
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Health check working!");
        response.put("status", "OK");
        response.put("timestamp", System.currentTimeMillis());
        response.put("test", 123);

        System.out.println("=== DEBUG: Returning: " + response);
        return response;
    }

    // ADD THIS SIMPLE TEST ENDPOINT
    @GetMapping("/simple")
    public Map<String, String> simpleTest() {
        System.out.println("=== DEBUG: Simple test endpoint called ===");

        Map<String, String> response = new HashMap<>();
        response.put("test", "This is a simple test");
        response.put("working", "yes");

        return response;
    }
}