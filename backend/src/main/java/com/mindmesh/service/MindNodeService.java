package com.mindmesh.service;

import com.mindmesh.dto.ConnectNodesRequest;
import com.mindmesh.dto.MindNodeDto;
import com.mindmesh.model.MindNode;
import com.mindmesh.repository.MindNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MindNodeService {

    private final MindNodeRepository mindNodeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<MindNodeDto> getAllNodes() {
        log.debug("Retrieving all mind nodes");
        List<MindNodeDto> nodes = mindNodeRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        log.debug("Retrieved {} nodes", nodes.size());
        return nodes;
    }

    public Optional<MindNodeDto> getNodeById(String id) {
        log.debug("Retrieving node by ID: {}", id);
        try {
            Long nodeId = Long.valueOf(id);
            Optional<MindNodeDto> node = mindNodeRepository.findById(nodeId).map(this::toDto);
            if (node.isPresent()) {
                log.debug("Node found: {}", nodeId);
            } else {
                log.warn("Node not found: {}", nodeId);
            }
            return node;
        } catch (NumberFormatException e) {
            log.error("Invalid node ID format: {}", id, e);
            throw new IllegalArgumentException("Invalid node ID: " + id);
        }
    }

    @Transactional
    public MindNodeDto createNode(MindNodeDto dto) {
        log.info("Creating new node: {}", dto.getTitle());
        MindNode node = new MindNode();
        node.setTitle(dto.getTitle());
        node.setDescription(dto.getDescription());
        node.setX(dto.getX());
        node.setY(dto.getY());
        node.setColor(dto.getColor());
        node.setType(dto.getType());
        MindNode saved = mindNodeRepository.save(node);
        MindNodeDto result = toDto(saved);
        log.info("Node created with ID: {}", saved.getId());
        messagingTemplate.convertAndSend("/topic/nodes", result);
        return result;
    }

    @Transactional
    public Optional<MindNodeDto> updateNode(String id, MindNodeDto dto) {
        log.info("Updating node ID: {}", id);
        try {
            Long nodeId = Long.valueOf(id);
            Optional<MindNode> existing = mindNodeRepository.findById(nodeId);
            if (existing.isPresent()) {
                MindNode node = existing.get();
                node.setTitle(dto.getTitle());
                node.setDescription(dto.getDescription());
                node.setX(dto.getX());
                node.setY(dto.getY());
                node.setColor(dto.getColor());
                node.setType(dto.getType());
                MindNode saved = mindNodeRepository.save(node);
                MindNodeDto result = toDto(saved);
                log.info("Node updated: {}", nodeId);
                messagingTemplate.convertAndSend("/topic/nodes", result);
                return Optional.of(result);
            } else {
                log.warn("Node not found for update: {}", nodeId);
                return Optional.empty();
            }
        } catch (NumberFormatException e) {
            log.error("Invalid node ID format for update: {}", id, e);
            throw new IllegalArgumentException("Invalid node ID: " + id);
        }
    }

    @Transactional
    public boolean deleteNode(String id) {
        log.info("Deleting node ID: {}", id);
        try {
            Long nodeId = Long.valueOf(id);
            if (mindNodeRepository.existsById(nodeId)) {
                mindNodeRepository.deleteById(nodeId);
                log.info("Node deleted: {}", nodeId);
                messagingTemplate.convertAndSend("/topic/nodes", Map.of("deleted", id));
                return true;
            } else {
                log.warn("Node not found for deletion: {}", nodeId);
                return false;
            }
        } catch (NumberFormatException e) {
            log.error("Invalid node ID format for deletion: {}", id);
            throw new IllegalArgumentException("Invalid node ID: " + id);
        }
    }

    @Transactional
    public Optional<MindNodeDto> patchNode(String id, Map<String, Object> updates) {
        log.info("Patching node ID: {}", id);
        try {
            Long nodeId = Long.valueOf(id);

            // Check if node exists
            if (!mindNodeRepository.existsById(nodeId)) {
                log.warn("Node not found for patch: {}", nodeId);
                return Optional.empty();
            }

            // Extract update values with null defaults
            String title = updates.containsKey("title") ? (String) updates.get("title") : null;
            String description = updates.containsKey("description") ? (String) updates.get("description") : null;
            Double x = updates.containsKey("x") ? ((Number) updates.get("x")).doubleValue() : null;
            Double y = updates.containsKey("y") ? ((Number) updates.get("y")).doubleValue() : null;
            String color = updates.containsKey("color") ? (String) updates.get("color") : null;
            String type = updates.containsKey("type") ? (String) updates.get("type") : null;

            // Update only the specified fields using Cypher query
            mindNodeRepository.updateNodeFields(nodeId, title, description, x, y, color, type);

            // Fetch the updated node
            MindNode updatedNode = mindNodeRepository.findById(nodeId).orElseThrow();
            MindNodeDto result = toDto(updatedNode);
            log.info("Node patched: {}", nodeId);
            messagingTemplate.convertAndSend("/topic/nodes", result);
            return Optional.of(result);
        } catch (NumberFormatException e) {
            log.error("Invalid node ID format for patch: {}", id, e);
            throw new IllegalArgumentException("Invalid node ID: " + id);
        } catch (Exception e) {
            log.error("Error patching node: {}", id, e);
            throw new RuntimeException("Error patching node: " + id, e);
        }
    }

    @Transactional
    public boolean connectNodes(ConnectNodesRequest request) {
        log.info("Connecting nodes: {} -> {}", request.getSourceId(), request.getTargetId());
        try {
            Long sourceId = Long.valueOf(request.getSourceId());
            Long targetId = Long.valueOf(request.getTargetId());
            Optional<MindNode> sourceOpt = mindNodeRepository.findById(sourceId);
            Optional<MindNode> targetOpt = mindNodeRepository.findById(targetId);
            if (sourceOpt.isPresent() && targetOpt.isPresent()) {
                
                List<MindNode> connectedNodes = mindNodeRepository.findConnectedNodes(sourceId);
                boolean alreadyConnected = connectedNodes.stream().anyMatch(node -> node.getId().equals(targetId));

                if (!alreadyConnected) {
                    mindNodeRepository.connectNodes(sourceId, targetId);
                    log.info("Nodes connected: {} -> {}", sourceId, targetId);
                    messagingTemplate.convertAndSend("/topic/graph", getAllNodes());
                    return true;
                } else {
                    log.warn("Nodes already connected: {} -> {}", sourceId, targetId);
                    return false;
                }
            } else {
                log.warn("One or both nodes not found for connection: {} -> {}", sourceId, targetId);
                return false;
            }
        } catch (NumberFormatException e) {
            log.error("Invalid node ID format for connection: {} -> {}", request.getSourceId(), request.getTargetId(),
                    e);
            throw new IllegalArgumentException(
                    "Invalid node IDs: " + request.getSourceId() + ", " + request.getTargetId());
        }
    }

    private MindNodeDto toDto(MindNode node) {
        return new MindNodeDto(
                node.getId(),
                node.getTitle(),
                node.getDescription(),
                node.getX(),
                node.getY(),
                node.getColor(),
                node.getType(),
                node.getCreatedAt(),
                node.getUpdatedAt(),
                node.getConnections().stream().map(MindNode::getId).collect(Collectors.toList()));
    }
}
