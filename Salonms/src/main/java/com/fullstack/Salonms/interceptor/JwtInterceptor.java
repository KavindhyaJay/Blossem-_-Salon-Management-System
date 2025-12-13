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

        // Public endpoints that don't need authentication
        if (path.startsWith("/api/admin/auth/login") ||
                path.startsWith("/api/admin/auth/init") ||
                path.startsWith("/api/staff/auth/login")) {
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

            // Check role for admin endpoints
            if (path.startsWith("/api/admin/") && !path.startsWith("/api/admin/auth/")) {
                String role = SimpleJwtUtil.extractRole(token);
                if (!"ADMIN".equals(role)) {
                    sendError(response, 403, "Admin access required");
                    return false;
                }
            }

            // Add user info to request
            request.setAttribute("userId", SimpleJwtUtil.extractUserId(token));
            request.setAttribute("email", SimpleJwtUtil.extractEmail(token));
            request.setAttribute("role", SimpleJwtUtil.extractRole(token));

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