package com.mindmesh.repository;

import com.mindmesh.model.MindNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for MindNode entities in Neo4j graph database.
 * Provides CRUD operations and custom queries for managing mind map nodes and their relationships.
 *
 * @author Yuri Pedrosa
 */
@Repository
public interface MindNodeRepository extends Neo4jRepository<MindNode, Long> {

    /**
     * Finds all nodes of a specific type.
     *
     * @param type the node type to search for
     * @return list of nodes matching the specified type
     */
    List<MindNode> findByType(String type);

    /**
     * Finds all nodes directly connected to the specified node.
     * Uses Cypher query to traverse CONNECTED_TO relationships in both directions.
     *
     * @param nodeId the ID of the node to find connections for
     * @return list of connected nodes
     */
    @Query("MATCH (n:MindNode)-[:CONNECTED_TO]-(m:MindNode) WHERE id(n) = $nodeId RETURN m")
    List<MindNode> findConnectedNodes(Long nodeId);

    /**
     * Creates a bidirectional connection between two nodes.
     * Uses MERGE to ensure the relationship is created only if it doesn't already exist.
     *
     * @param sourceId the ID of the source node
     * @param targetId the ID of the target node
     */
    @Query("MATCH (source:MindNode), (target:MindNode) WHERE id(source) = $sourceId AND id(target) = $targetId MERGE (source)-[:CONNECTED_TO]-(target)")
    void connectNodes(Long sourceId, Long targetId);

    /**
     * Updates specific fields of a node using conditional SET clauses.
     * Only updates fields that are provided (not null).
     *
     * @param nodeId the ID of the node to update
     * @param title new title (null to keep existing)
     * @param description new description (null to keep existing)
     * @param x new x-coordinate (null to keep existing)
     * @param y new y-coordinate (null to keep existing)
     * @param color new color (null to keep existing)
     * @param type new type (null to keep existing)
     */
    @Query("MATCH (n:MindNode) WHERE id(n) = $nodeId SET n.title = CASE WHEN $title IS NOT NULL THEN $title ELSE n.title END, n.description = CASE WHEN $description IS NOT NULL THEN $description ELSE n.description END, n.x = CASE WHEN $x IS NOT NULL THEN $x ELSE n.x END, n.y = CASE WHEN $y IS NOT NULL THEN $y ELSE n.y END, n.color = CASE WHEN $color IS NOT NULL THEN $color ELSE n.color END, n.type = CASE WHEN $type IS NOT NULL THEN $type ELSE n.type END")
    void updateNodeFields(Long nodeId, String title, String description, Double x, Double y, String color, String type);
}
