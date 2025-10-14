package com.mindmesh.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectNodesRequest {

    @NotBlank(message = "Source ID cannot be blank")
    private String sourceId;
    @NotBlank(message = "Target ID cannot be blank")
    private String targetId;
}
