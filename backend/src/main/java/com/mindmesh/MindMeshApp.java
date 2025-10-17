package com.mindmesh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.config.EnableNeo4jAuditing;

/**
 * Main application class for MindMesh, a collaborative real-time mind mapping application.
 * This Spring Boot application integrates with Neo4j for graph persistence and WebSocket for real-time collaboration.
 *
 * Features:
 * - Real-time collaborative mind mapping
 * - Graph-based persistence using Neo4j
 * - WebSocket communication for live updates
 * - REST API for node management
 *
 * @author Yuri Pedrosa
 */
@SpringBootApplication
@EnableNeo4jAuditing
public class MindMeshApp {

    /**
     * Main method to start the Spring Boot application.
     *
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(MindMeshApp.class, args);
    }

}
