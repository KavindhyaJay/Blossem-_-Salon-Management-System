// File: FileStorageConfig.java
package com.fullstack.Salonms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for file storage and static resource handling.
 * Configures how uploaded files and static resources are served by the application.
 */
@Configuration // Marks this class as a Spring configuration class
public class FileStorageConfig implements WebMvcConfigurer {

    // Injects the file upload directory from application.properties
    // Defaults to "uploads/photos" if property is not specified
    @Value("${file.upload-dir:uploads/photos}")
    private String uploadDir;

    /**
     * Configures resource handlers to serve static files
     * 
     * @param registry The resource handler registry to add configurations to
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded photos via HTTP URL at /uploads/photos/**
        registry.addResourceHandler("/uploads/photos/**")
                .addResourceLocations("file:" + uploadDir + "/");

        // Serve static resources from the classpath (for frontend files)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}