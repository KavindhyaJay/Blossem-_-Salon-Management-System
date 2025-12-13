// File: HealthController.java
package com.fullstack.Salonms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());

        try {
            // Test MongoDB connection
            String dbName = mongoTemplate.getDb().getName();
            response.put("mongodb", "CONNECTED");
            response.put("database", dbName);
        } catch (Exception e) {
            response.put("mongodb", "DISCONNECTED");
            response.put("error", e.getMessage());
        }

        return response;
    }
}