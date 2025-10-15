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
}
