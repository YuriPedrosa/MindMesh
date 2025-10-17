package com.mindmesh.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration class for WebSocket messaging using STOMP protocol.
 * Enables real-time communication for collaborative mind mapping features.
 * Configures message broker and STOMP endpoints for client-server communication.
 *
 * @author Yuri Pedrosa
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configures the message broker for handling WebSocket messages.
     * Sets up simple broker for broadcasting to topics and application destination prefix.
     *
     * @param config the message broker registry to configure
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registers STOMP endpoints for WebSocket connections.
     * Enables SockJS fallback for browsers that don't support WebSocket natively.
     * Restricted to localhost origins for development security.
     *
     * @param registry the STOMP endpoint registry to configure
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:*") // Restrict to localhost for security
                .withSockJS();
    }
}
