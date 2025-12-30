package com.fullstack.Salonms.util;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenUtil {

    private static final String SECRET_KEY = "salon-management-system-secret-key-2024-change-in-production";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours

    private final Base64.Encoder encoder = Base64.getUrlEncoder();
    private final Base64.Decoder decoder = Base64.getUrlDecoder();

    public String generateToken(String userId, String email, String role) {
        try {
            // Create header
            String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String encodedHeader = encoder.encodeToString(header.getBytes());

            // Create payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("userId", userId);
            payload.put("role", role);
            payload.put("iat", System.currentTimeMillis() / 1000);
            payload.put("exp", (System.currentTimeMillis() + EXPIRATION_TIME) / 1000);

            String payloadJson = mapToJson(payload);
            String encodedPayload = encoder.encodeToString(payloadJson.getBytes());

            // Create signature (simple hash for now)
            String data = encodedHeader + "." + encodedPayload;
            String signature = simpleHash(data + SECRET_KEY);

            return data + "." + signature;

        } catch (Exception e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            String header = parts[0];
            String payload = parts[1];
            String providedSignature = parts[2];

            // Verify signature
            String data = header + "." + payload;
            String expectedSignature = simpleHash(data + SECRET_KEY);

            if (!constantTimeEquals(providedSignature, expectedSignature)) {
                return false;
            }

            // Verify expiration
            String payloadJson = new String(decoder.decode(payload), StandardCharsets.UTF_8);
            Map<String, Object> payloadMap = jsonToMap(payloadJson);

            Long exp = (Long) payloadMap.get("exp");
            if (exp == null || exp * 1000 < System.currentTimeMillis()) {
                return false;
            }

            return true;

        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return extractClaim(token, "sub");
    }

    public String extractRole(String token) {
        return extractClaim(token, "role");
    }

    public String extractUserId(String token) {
        return extractClaim(token, "userId");
    }

    private String extractClaim(String token, String claim) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid token");
            }

            String payload = parts[1];
            String payloadJson = new String(decoder.decode(payload), StandardCharsets.UTF_8);
            Map<String, Object> payloadMap = jsonToMap(payloadJson);

            return (String) payloadMap.get(claim);

        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
    }

    private String simpleHash(String input) {
        try {
            // Simple hash for demo - in production use proper HMAC
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return encoder.encodeToString(hash).replace("=", "");
        } catch (Exception e) {
            throw new RuntimeException("Error hashing", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;

        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) {
                json.append(",");
            }
            json.append("\"").append(entry.getKey()).append("\":");

            Object value = entry.getValue();
            if (value instanceof String) {
                json.append("\"").append(value).append("\"");
            } else {
                json.append(value);
            }
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    private Map<String, Object> jsonToMap(String json) {
        Map<String, Object> map = new HashMap<>();
        json = json.trim().substring(1, json.length() - 1);

        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim().replace("\"", "");
                String value = keyValue[1].trim();

                if (value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                    map.put(key, value);
                } else {
                    try {
                        map.put(key, Long.parseLong(value));
                    } catch (NumberFormatException e) {
                        map.put(key, value);
                    }
                }
            }
        }
        return map;
    }
}