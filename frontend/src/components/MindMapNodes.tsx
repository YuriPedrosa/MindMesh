import React from "react";
import MindNode from "./MindNode";
import type { MindNode as MindNodeType } from "../store/mindNodeStore";
import { getNodePosition, getConnectionState } from "../utils/mindMapUtils";

interface MindMapNodesProps {
  nodes: MindNodeType[];
  draggedPositions: Record<string, { x: number; y: number }>;
  isConnecting: boolean;
  sourceNodeId: string | null;
  hoveredNodeId: string | null;
  sourceNode: MindNodeType | null | undefined;
  onUpdate: (id: string, updates: Partial<{ title: string; x: number; y: number; color: string }>) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  onDrag: (id: string, x: number, y: number) => void;
}

const MindMapNodes: React.FC<MindMapNodesProps> = ({
  nodes,
  draggedPositions,
  isConnecting,
  sourceNodeId,
  hoveredNodeId,
  sourceNode,
  onUpdate,
  onEdit,
  onDelete,
  onConnectStart,
  onConnectEnd,
  onContextMenu,
  onHoverStart,
  onHoverEnd,
  onDrag,
}) => {
  return (
    <>
      {nodes.map((node) => {
        const position = getNodePosition(node, draggedPositions);
        const connectionState = getConnectionState(node, isConnecting, sourceNodeId, hoveredNodeId, sourceNode);
        return (
          <MindNode
            key={node.id}
            id={node.id.toString()}
            title={node.title}
            position={position}
            color={node.color}
            type={node.type}
            callbacks={{
              onUpdate: (id, updates) => onUpdate(id, updates),
              onEdit,
              onDelete,
              onConnectStart,
              onConnectEnd,
              onContextMenu,
              onHoverStart,
              onHoverEnd,
            }}
            connectionState={connectionState}
            onDrag={onDrag}
          />
        );
      })}
    </>
  );
};

export default MindMapNodes;
