package com.mindmesh.controller;

import com.mindmesh.dto.ConnectNodesRequest;
import com.mindmesh.service.MindNodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final MindNodeService mindNodeService;

    @MessageMapping("/connect")
    public void connectNodes(@Payload ConnectNodesRequest request) {
        mindNodeService.connectNodes(request);
    }
}
