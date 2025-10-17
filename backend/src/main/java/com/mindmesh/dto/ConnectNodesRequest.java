package com.mindmesh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for connecting two mind map nodes.
 * Contains the IDs of the source and target nodes to be connected.
 *
 * @author Yuri Pedrosa
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to connect two mind map nodes")
public class ConnectNodesRequest {

    @Schema(description = "ID of the source node", example = "1", required = true)
    @NotBlank(message = "Source ID cannot be blank")
    private String sourceId;

    @Schema(description = "ID of the target node", example = "2", required = true)
    @NotBlank(message = "Target ID cannot be blank")
    private String targetId;
}
