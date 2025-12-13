// File: AuthTest.java
package com.fullstack.Salonms.test;

import com.fullstack.Salonms.util.PasswordUtil;
import com.fullstack.Salonms.util.SimpleJwtUtil;

public class AuthTest {
    public static void main(String[] args) {
        System.out.println("=== Testing Password Hashing ===");
        String password = "admin123";
        String hashed = PasswordUtil.hashPassword(password);
        System.out.println("Original: " + password);
        System.out.println("Hashed: " + hashed);
        System.out.println("Verify correct: " + PasswordUtil.verifyPassword("admin123", hashed));
        System.out.println("Verify wrong: " + PasswordUtil.verifyPassword("wrong", hashed));

        System.out.println("\n=== Testing JWT ===");
        String token = SimpleJwtUtil.generateToken("admin123", "admin@salon.com", "ADMIN");
        System.out.println("Generated Token: " + token);
        System.out.println("Token valid: " + SimpleJwtUtil.validateToken(token));
        System.out.println("Email: " + SimpleJwtUtil.extractEmail(token));
        System.out.println("Role: " + SimpleJwtUtil.extractRole(token));
        System.out.println("User ID: " + SimpleJwtUtil.extractUserId(token));

        // Test invalid token
        System.out.println("Invalid token: " + SimpleJwtUtil.validateToken("invalid.token.here"));
    }
}