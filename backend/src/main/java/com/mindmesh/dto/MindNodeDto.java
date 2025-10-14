package com.mindmesh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MindNodeDto {

    private Long id;
    @NotBlank(message = "Title cannot be blank")
    private String title;
    private String description;
    @NotNull(message = "X position is required")
    private Double x;
    @NotNull(message = "Y position is required")
    private Double y;
    private String color;
    @NotBlank(message = "Type cannot be blank")
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Long> connectionIds;
}
