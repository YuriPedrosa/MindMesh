import React, { useRef, useEffect, useState } from "react";
import MindNode from "./MindNode";
import { useMindNodeStore } from "../store/mindNodeStore";
import NewNodeEditor from "./NewNodeEditor";
import type { NodeType } from "../types/nodeTypes";

const MindMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, addNode, updateNode, removeNode, fetchNodes, connectNodes } =
    useMindNodeStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const links = nodes.flatMap(
    (node) =>
      node.connectionIds
        ?.map((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          return target ? { source: node, target } : null;
        })
        .filter(Boolean) || []
  );

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

  const handleConnectStart = (id: string) => {
    if (id) {
      setIsConnecting(true);
      setSourceNodeId(id);
    } else {
      setIsConnecting(false);
      setSourceNodeId(null);
    }
  };

  const handleConnectEnd = (targetId: string) => {
    if (sourceNodeId && sourceNodeId !== targetId) {
      connectNodes(parseInt(sourceNodeId), parseInt(targetId));
    }
    setIsConnecting(false);
    setSourceNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isConnecting) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const sourceNode = sourceNodeId ? nodes.find(n => n.id.toString() === sourceNodeId) : null;

  return (
    <div
      className="relative w-full h-full bg-transparent overflow-hidden"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Draw connections */}
        {links.map((link, index) => (
          link && (
            <line
              key={index}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="#999"
              strokeWidth={2}
            />
          )
        ))}
        {/* Draw temporary connection arrow */}
        {isConnecting && sourceNode && (
          <line
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="#3B82F6"
            strokeWidth={3}
            markerEnd="url(#arrowhead)"
          />
        )}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#3B82F6"
            />
          </marker>
        </defs>
      </svg>
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
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          isConnecting={isConnecting}
          isSource={sourceNodeId === node.id.toString()}
          isTarget={false} // Could be enhanced to highlight potential targets
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
