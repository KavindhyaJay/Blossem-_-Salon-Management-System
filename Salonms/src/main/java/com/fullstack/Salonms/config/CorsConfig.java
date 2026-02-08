// File: CorsConfig.java
package com.fullstack.Salonms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS (Cross-Origin Resource Sharing) Configuration Class
 * 
 * This class configures CORS policies for the Spring Boot application,
 * allowing or restricting cross-origin requests to the API endpoints.
 * CORS is a security feature implemented by browsers to prevent 
 * web pages from making requests to a different domain than the one 
 * that served the web page.
 */
@Configuration // Marks this class as a Spring configuration class
public class CorsConfig {

    /**
     * Creates and configures a CORS configuration bean
     * 
     * @return WebMvcConfigurer instance with CORS settings
     */
    @Bean // Registers the returned object as a Spring bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            /**
             * Configures CORS mappings for the application
             * 
             * @param registry The CORS registry to add mappings to
             */
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Apply CORS settings to all API endpoints
                        .allowedOrigins("*") // Allow requests from any origin (consider restricting in production)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // Allowed HTTP methods
                        .allowedHeaders("*") // Allow all headers in requests
                        .exposedHeaders("Authorization") // Expose Authorization header to the client
                        .allowCredentials(false) // Disable credentials (cookies, auth headers) - must be false when origins is "*"
                        .maxAge(3600); // Cache preflight response for 1 hour (3600 seconds)
            }
        };
    }
}