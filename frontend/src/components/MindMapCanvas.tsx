import React from "react";
import type { MindNode } from "../store/mindNodeStore";

interface Link {
  source: { x: number; y: number };
  target: { x: number; y: number };
}

interface MindMapCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  links: (Link | null)[];
  isConnecting: boolean;
  sourceNode: MindNode | null | undefined;
  mousePosition: { x: number; y: number };
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  svgRef,
  links,
  isConnecting,
  sourceNode,
  mousePosition,
}) => {
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
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
            markerEnd="url(#connection-arrow)"
          />
        )
      ))}
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
  );
};

export default MindMapCanvas;
