package com.mindmesh.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS).
 * Allows the frontend application to make requests to the backend API.
 * Configured for development environment with localhost origins.
 *
 * @author Yuri Pedrosa
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Configures CORS mappings for API endpoints.
     * Allows requests from localhost on any port (for development flexibility)
     * and supports all necessary HTTP methods and headers for the mind map application.
     *
     * @param registry the CORS registry to configure
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*") // Allow localhost with any port for development
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization", "X-Requested-With")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight response for 1 hour
    }
}
