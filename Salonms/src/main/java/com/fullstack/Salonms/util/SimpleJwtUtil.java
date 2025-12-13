// File: SimpleJwtUtil.java
package com.fullstack.Salonms.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class SimpleJwtUtil {

    private static final String SECRET_KEY = "salon-management-system-secret-key-2024";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours
    private static final Base64.Encoder encoder = Base64.getUrlEncoder();
    private static final Base64.Decoder decoder = Base64.getUrlDecoder();

    // Generate JWT token
    public static String generateToken(String userId, String email, String role) {
        try {
            // Create header
            Map<String, String> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String encodedHeader = encoder.encodeToString(headerJson.getBytes());

            // Create payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("userId", userId);
            payload.put("role", role);
            payload.put("iat", System.currentTimeMillis() / 1000);
            payload.put("exp", (System.currentTimeMillis() + EXPIRATION_TIME) / 1000);
            payload.put("jti", UUID.randomUUID().toString());

            String payloadJson = mapToJson(payload);
            String encodedPayload = encoder.encodeToString(payloadJson.getBytes());

            // Create signature
            String data = encodedHeader + "." + encodedPayload;
            String signature = hmacSha256(data, SECRET_KEY);

            return data + "." + signature;

        } catch (Exception e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    // Validate JWT token
    public static boolean validateToken(String token) {
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
            String expectedSignature = hmacSha256(data, SECRET_KEY);

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

    // Extract claims from token
    public static Map<String, Object> extractClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid token format");
            }

            String payload = parts[1];
            String payloadJson = new String(decoder.decode(payload), StandardCharsets.UTF_8);
            return jsonToMap(payloadJson);

        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
    }

    // Extract email from token
    public static String extractEmail(String token) {
        Map<String, Object> claims = extractClaims(token);
        return (String) claims.get("sub");
    }

    // Extract role from token
    public static String extractRole(String token) {
        Map<String, Object> claims = extractClaims(token);
        return (String) claims.get("role");
    }

    // Extract user ID from token
    public static String extractUserId(String token) {
        Map<String, Object> claims = extractClaims(token);
        return (String) claims.get("userId");
    }

    // Simple HMAC SHA-256
    private static String hmacSha256(String data, String key) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);

        // Simple XOR-based HMAC (for demo - in production use proper HMAC)
        byte[] result = new byte[keyBytes.length];
        for (int i = 0; i < keyBytes.length; i++) {
            if (i < dataBytes.length) {
                result[i] = (byte) (keyBytes[i] ^ dataBytes[i]);
            } else {
                result[i] = keyBytes[i];
            }
        }

        digest.update(result);
        byte[] hash = digest.digest();

        // Double hash for better security
        digest.update(hash);
        byte[] finalHash = digest.digest();

        return encoder.encodeToString(finalHash).replace("=", "");
    }

    // Constant-time string comparison
    private static boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    // Simple map to JSON conversion
    private static String mapToJson(Map<String, Object> map) {
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
            } else if (value instanceof Number) {
                json.append(value);
            } else {
                json.append("\"").append(value.toString()).append("\"");
            }
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    // Simple JSON to map conversion
    private static Map<String, Object> jsonToMap(String json) {
        Map<String, Object> map = new HashMap<>();
        json = json.trim().substring(1, json.length() - 1);

        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim().replace("\"", "");
                String value = keyValue[1].trim();

                // Remove quotes if present
                if (value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                    map.put(key, value);
                } else {
                    // Try to parse as number
                    try {
                        if (value.contains(".")) {
                            map.put(key, Double.parseDouble(value));
                        } else {
                            map.put(key, Long.parseLong(value));
                        }
                    } catch (NumberFormatException e) {
                        map.put(key, value);
                    }
                }
            }
        }
        return map;
    }
}