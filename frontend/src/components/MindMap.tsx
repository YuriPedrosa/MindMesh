import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import MindNode from "./MindNode";
import { useMindNodeStore } from "../store/mindNodeStore";
import NewNodeEditor from "./NewNodeEditor";
import type { NodeType } from "../types/nodeTypes";

const MindMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, addNode, updateNode, removeNode, fetchNodes } =
    useMindNodeStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw connections
    const links = nodes.flatMap(
      (node) =>
        node.connectionIds
          ?.map((targetId) => {
            const target = nodes.find((n) => n.id === targetId);
            return target ? { source: node, target } : null;
          })
          .filter(Boolean) || []
    );

    svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("x1", (d) => d!.source.x)
      .attr("y1", (d) => d!.source.y)
      .attr("x2", (d) => d!.target.x)
      .attr("y2", (d) => d!.target.y);
  }, [nodes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickPosition({ x, y });
    setIsEditorOpen(true);
  };

  const handleEditorSave = (config: {
    title: string;
    color: string;
    type: NodeType;
  }) => {
    addNode({
      title: config.title,
      x: clickPosition.x,
      y: clickPosition.y,
      color: config.color,
      type: config.type,
    });
    setIsEditorOpen(false);
  };

  const handleEditorCancel = () => {
    setIsEditorOpen(false);
  };

  return (
    <div
      className="relative w-full h-full bg-transparent overflow-hidden"
      onClick={handleCanvasClick}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {nodes.map((node) => (
        <MindNode
          key={node.id}
          id={node.id.toString()}
          title={node.title}
          x={node.x}
          y={node.y}
          color={node.color}
          onUpdate={(id, updates) => updateNode(parseInt(id), updates)}
          onDelete={(id) => removeNode(parseInt(id))}
        />
      ))}
      {isEditorOpen && (
        <NewNodeEditor
          x={clickPosition.x}
          y={clickPosition.y}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
};

export default MindMap;
