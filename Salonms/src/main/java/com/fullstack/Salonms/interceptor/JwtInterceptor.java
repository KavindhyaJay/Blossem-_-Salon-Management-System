package com.fullstack.Salonms.interceptor;

import com.fullstack.Salonms.util.SimpleJwtUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String path = request.getRequestURI();

        // ================= PUBLIC ENDPOINTS =================
        if (path.startsWith("/api/admin/auth/login") ||
                path.startsWith("/api/admin/auth/init") ||
                path.startsWith("/api/staff/auth/login") ||
                path.startsWith("/api/staff/auth/forgot-password") ||
                path.startsWith("/api/staff/auth/check-status") ||
                path.startsWith("/api/health") ||
                path.startsWith("/api/test/") ||
                path.startsWith("/api/debug/") ||
                path.startsWith("/api/public/")) {  // ALL public endpoints
            return true;
        }

        // Get Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, 401, "Missing or invalid authorization header");
            return false;
        }

        String token = authHeader.substring(7);

        try {
            // Validate token
            if (!SimpleJwtUtil.validateToken(token)) {
                sendError(response, 401, "Invalid or expired token");
                return false;
            }

            String role = SimpleJwtUtil.extractRole(token);
            String userId = SimpleJwtUtil.extractUserId(token);

            // ================= ADMIN-ONLY ENDPOINTS =================
            if (path.startsWith("/api/admin/") && !path.startsWith("/api/admin/auth/")) {
                if (!"ADMIN".equals(role)) {
                    sendError(response, 403, "Admin access required");
                    return false;
                }
            }

            // ================= STAFF PHOTO ENDPOINTS =================
            if (path.startsWith("/api/staff/photos")) {
                if (!"STAFF".equals(role)) {
                    sendError(response, 403, "Staff access required");
                    return false;
                }

                // For DELETE /api/staff/photos/{id}, ensure staff can only delete their own
                if (path.matches("/api/staff/photos/[^/]+") && "DELETE".equals(request.getMethod())) {
                    String photoId = path.substring(path.lastIndexOf("/") + 1);
                    // The controller will verify ownership
                }
            }

            // ================= STAFF APPOINTMENT ENDPOINTS =================
            if (path.startsWith("/api/staff/appointments/") ||
                    path.startsWith("/api/staff/me")) {
                if (!"STAFF".equals(role)) {
                    sendError(response, 403, "Staff access required");
                    return false;
                }
            }

            // ================= STAFF MANAGEMENT ENDPOINTS =================
            if (path.startsWith("/api/staff/") &&
                    !path.startsWith("/api/staff/auth/") &&
                    !path.startsWith("/api/staff/photos") &&
                    !path.startsWith("/api/staff/appointments/") &&
                    !path.startsWith("/api/staff/me")) {
                // Only ADMIN can access general staff management
                if (!"ADMIN".equals(role)) {
                    sendError(response, 403, "Admin access required");
                    return false;
                }
            }

            // ================= ADMIN PHOTO ENDPOINTS =================
            if (path.startsWith("/api/admin/photos")) {
                if (!"ADMIN".equals(role)) {
                    sendError(response, 403, "Admin access required");
                    return false;
                }
            }

            // Add user info to request
            request.setAttribute("userId", userId);
            request.setAttribute("email", SimpleJwtUtil.extractEmail(token));
            request.setAttribute("role", role);

            return true;

        } catch (Exception e) {
            sendError(response, 401, "Invalid token");
            return false;
        }
    }

    private void sendError(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter writer = response.getWriter();
        writer.write("{\"error\": \"" + message + "\"}");
        writer.flush();
    }
}