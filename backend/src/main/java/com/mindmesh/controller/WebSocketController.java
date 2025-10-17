package com.mindmesh.controller;

import com.mindmesh.dto.ConnectNodesRequest;
import com.mindmesh.service.MindNodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for handling real-time mind map operations.
 * Manages WebSocket message mappings for collaborative features like node connections.
 * Uses STOMP protocol for message handling.
 *
 * @author Yuri Pedrosa
 */
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final MindNodeService mindNodeService;

    /**
     * Handles WebSocket messages for connecting two nodes in the mind map.
     * Receives connection requests from clients and delegates to the service layer.
     *
     * @param request the connection request containing source and target node IDs
     */
    @MessageMapping("/connect")
    public void connectNodes(@Payload ConnectNodesRequest request) {
        mindNodeService.connectNodes(request);
    }
}
