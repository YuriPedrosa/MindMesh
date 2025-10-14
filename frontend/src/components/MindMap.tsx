import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import MindNode from "./MindNode";
import { useMindNodeStore } from "../store/mindNodeStore";

const MindMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, addNode, updateNode, removeNode } = useMindNodeStore();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw connections
    const links = nodes.flatMap(
      (node) =>
        node.connections
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
    console.log("debug", { e });

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newNode = {
      id: Date.now().toString(),
      title: "Novo Nó",
      x,
      y,
      color: "#3B82F6",
    };
    addNode(newNode);
  };

  return (
    <div
      className="relative w-full h-full bg-white overflow-hidden"
      onClick={handleCanvasClick}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {nodes.map((node) => (
        <MindNode
          key={node.id}
          id={node.id}
          title={node.title}
          x={node.x}
          y={node.y}
          color={node.color}
          onUpdate={updateNode}
          onDelete={removeNode}
        />
      ))}
    </div>
  );
};

export default MindMap;
