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

/**
 * Service class for managing mind map nodes and their operations.
 * Handles business logic for CRUD operations, node connections, and real-time broadcasting via WebSocket.
 * All operations are transactional and include logging and WebSocket notifications.
 *
 * @author Yuri Pedrosa
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MindNodeService {

    private final MindNodeRepository mindNodeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Parses a string ID to Long, handling invalid formats.
     *
     * @param id the string representation of the node ID
     * @return the parsed Long ID
     * @throws IllegalArgumentException if the ID format is invalid
     */
    private Long parseId(String id) {
        try {
            return Long.valueOf(id);
        } catch (NumberFormatException e) {
            log.error("Invalid node ID format: {}", id, e);
            throw new IllegalArgumentException("Invalid node ID: " + id);
        }
    }

    /**
     * Checks if a node exists in the repository.
     *
     * @param id the node ID to check
     * @return true if the node exists, false otherwise
     */
    private boolean nodeExists(Long id) {
        return mindNodeRepository.existsById(id);
    }

    /**
     * Retrieves all mind map nodes from the repository.
     *
     * @return list of all nodes as DTOs
     */
    public List<MindNodeDto> getAllNodes() {
        log.debug("Retrieving all mind nodes");
        List<MindNodeDto> nodes = mindNodeRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        log.debug("Retrieved {} nodes", nodes.size());
        return nodes;
    }

    /**
     * Retrieves a specific node by its ID.
     *
     * @param id the string representation of the node ID
     * @return Optional containing the node DTO if found, empty otherwise
     */
    public Optional<MindNodeDto> getNodeById(String id) {
        log.debug("Retrieving node by ID: {}", id);
        Long nodeId = parseId(id);
        Optional<MindNodeDto> node = mindNodeRepository.findById(nodeId).map(this::toDto);
        if (node.isPresent()) {
            log.debug("Node found: {}", nodeId);
        } else {
            log.warn("Node not found: {}", nodeId);
        }
        return node;
    }

    /**
     * Creates a new mind map node and broadcasts the creation via WebSocket.
     *
     * @param dto the node data transfer object containing node information
     * @return the created node as DTO
     */
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

    /**
     * Updates an existing node with new data and broadcasts the update via WebSocket.
     *
     * @param id the string representation of the node ID to update
     * @param dto the updated node data
     * @return Optional containing the updated node DTO if found, empty otherwise
     */
    @Transactional
    public Optional<MindNodeDto> updateNode(String id, MindNodeDto dto) {
        log.info("Updating node ID: {}", id);
        Long nodeId = parseId(id);
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
    }

    /**
     * Deletes a node by ID and broadcasts the deletion via WebSocket.
     *
     * @param id the string representation of the node ID to delete
     * @return true if the node was deleted, false if not found
     */
    @Transactional
    public boolean deleteNode(String id) {
        log.info("Deleting node ID: {}", id);
        Long nodeId = parseId(id);
        if (nodeExists(nodeId)) {
            mindNodeRepository.deleteById(nodeId);
            log.info("Node deleted: {}", nodeId);
            messagingTemplate.convertAndSend("/topic/nodes", Map.of("deleted", id));
            return true;
        } else {
            log.warn("Node not found for deletion: {}", nodeId);
            return false;
        }
    }

    /**
     * Partially updates a node with the provided fields and broadcasts the update via WebSocket.
     * Only the fields present in the updates map will be modified.
     *
     * @param id the string representation of the node ID to patch
     * @param updates map of field names to new values
     * @return Optional containing the updated node DTO if found, empty otherwise
     * @throws IllegalArgumentException if the ID format is invalid
     * @throws RuntimeException if an error occurs during patching
     */
    @Transactional
    public Optional<MindNodeDto> patchNode(String id, Map<String, Object> updates) {
        log.info("Patching node ID: {}", id);
        try {
            Long nodeId = parseId(id);

            // Check if node exists
            if (!nodeExists(nodeId)) {
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

    /**
     * Creates a connection between two nodes and broadcasts the updated graph via WebSocket.
     * Checks if both nodes exist and if they're not already connected.
     *
     * @param request the connection request containing source and target node IDs
     * @return true if the connection was created, false if nodes don't exist or are already connected
     * @throws RuntimeException if an error occurs during connection
     */
    @Transactional
    public boolean connectNodes(ConnectNodesRequest request) {
        try {
        log.info("Connecting nodes: {} -> {}", request.getSourceId(), request.getTargetId());
        Long sourceId = parseId(request.getSourceId());
        Long targetId = parseId(request.getTargetId());

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
        } catch (Exception e) {
            log.error("Error connecting nodes: {} -> {}", request.getSourceId(), request.getTargetId(), e);
            throw new RuntimeException("Error connecting nodes: " + request.getSourceId() + " -> " + request.getTargetId(), e);
        }
    }

    /**
     * Converts a MindNode entity to its DTO representation.
     * Maps all fields and converts connections to a list of IDs.
     *
     * @param node the entity to convert
     * @return the corresponding DTO
     */
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
