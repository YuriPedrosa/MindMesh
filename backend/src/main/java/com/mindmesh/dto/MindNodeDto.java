package com.mindmesh.dto;

import com.mindmesh.model.NodeType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for MindNode entities.
 * Used for API communication between client and server.
 * Contains validation annotations and OpenAPI documentation.
 *
 * @author Yuri Pedrosa
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Mind map node data transfer object")
public class MindNodeDto {

    @Schema(description = "Unique identifier of the node", example = "1")
    private Long id;

    @Schema(description = "Title of the node", example = "Main Idea", required = true)
    @NotBlank(message = "Title cannot be blank")
    private String title;

    @Schema(description = "Detailed description of the node", example = "This is the central concept")
    private String description;

    @Schema(description = "X-coordinate position on the canvas", example = "100.0", required = true)
    @NotNull(message = "X position is required")
    private Double x;

    @Schema(description = "Y-coordinate position on the canvas", example = "200.0", required = true)
    @NotNull(message = "Y position is required")
    private Double y;

    @Schema(description = "Hex color code for the node", example = "#FF5733")
    private String color;

    @Schema(description = "Type of the node", required = true)
    @NotNull(message = "Type is required")
    private NodeType type;

    @Schema(description = "Timestamp when the node was created")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when the node was last updated")
    private LocalDateTime updatedAt;

    @Schema(description = "List of IDs of connected nodes")
    private List<Long> connectionIds;
}
