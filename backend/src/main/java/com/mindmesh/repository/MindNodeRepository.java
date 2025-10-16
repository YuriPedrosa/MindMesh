package com.mindmesh.repository;

import com.mindmesh.model.MindNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MindNodeRepository extends Neo4jRepository<MindNode, Long> {

    List<MindNode> findByType(String type);

    @Query("MATCH (n:MindNode)-[:CONNECTED_TO]-(m:MindNode) WHERE id(n) = $nodeId RETURN m")
    List<MindNode> findConnectedNodes(Long nodeId);

    @Query("MATCH (source:MindNode), (target:MindNode) WHERE id(source) = $sourceId AND id(target) = $targetId MERGE (source)-[:CONNECTED_TO]-(target)")
    void connectNodes(Long sourceId, Long targetId);

    @Query("MATCH (n:MindNode) WHERE id(n) = $nodeId SET n.title = CASE WHEN $title IS NOT NULL THEN $title ELSE n.title END, n.description = CASE WHEN $description IS NOT NULL THEN $description ELSE n.description END, n.x = CASE WHEN $x IS NOT NULL THEN $x ELSE n.x END, n.y = CASE WHEN $y IS NOT NULL THEN $y ELSE n.y END, n.color = CASE WHEN $color IS NOT NULL THEN $color ELSE n.color END, n.type = CASE WHEN $type IS NOT NULL THEN $type ELSE n.type END")
    void updateNodeFields(Long nodeId, String title, String description, Double x, Double y, String color, String type);
}
