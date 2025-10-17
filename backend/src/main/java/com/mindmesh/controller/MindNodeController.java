package com.mindmesh.controller;

import com.mindmesh.dto.ConnectNodesRequest;
import com.mindmesh.dto.MindNodeDto;
import com.mindmesh.service.MindNodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing mind map nodes.
 * Provides endpoints for CRUD operations on nodes and node connections.
 * All operations are documented with OpenAPI annotations for API documentation.
 *
 * @author Yuri Pedrosa
 */
@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
@Tag(name = "Mind Node Management", description = "APIs for managing mind map nodes and their connections")
public class MindNodeController {

    private final MindNodeService mindNodeService;

    @Operation(summary = "Get all mind nodes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all nodes")
    })
    @GetMapping
    public ResponseEntity<List<MindNodeDto>> getAllNodes() {
        return ResponseEntity.ok(mindNodeService.getAllNodes());
    }

    @Operation(summary = "Get a mind node by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved node"),
            @ApiResponse(responseCode = "404", description = "Node not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MindNodeDto> getNodeById(@PathVariable String id) {
        return mindNodeService.getNodeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new mind node")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully created node"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<MindNodeDto> createNode(@Valid @RequestBody MindNodeDto dto) {
        return ResponseEntity.ok(mindNodeService.createNode(dto));
    }

    @Operation(summary = "Update an existing mind node")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated node"),
            @ApiResponse(responseCode = "404", description = "Node not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MindNodeDto> updateNode(@PathVariable String id, @Valid @RequestBody MindNodeDto dto) {
        return mindNodeService.updateNode(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Partially update an existing mind node")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated node"),
            @ApiResponse(responseCode = "404", description = "Node not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<MindNodeDto> patchNode(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return mindNodeService.patchNode(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a mind node by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted node"),
            @ApiResponse(responseCode = "404", description = "Node not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable String id) {
        return mindNodeService.deleteNode(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Connect two mind nodes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully connected nodes"),
            @ApiResponse(responseCode = "400", description = "Invalid request or nodes already connected")
    })
    @PostMapping("/connect")
    public ResponseEntity<Void> connectNodes(@Valid @RequestBody ConnectNodesRequest request) {
        return mindNodeService.connectNodes(request) ? ResponseEntity.ok().build()
                : ResponseEntity.badRequest().build();
    }
}
