// File: FileStorageConfig.java
package com.fullstack.Salonms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/photos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Make uploaded files accessible via URL
        registry.addResourceHandler("/uploads/photos/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
