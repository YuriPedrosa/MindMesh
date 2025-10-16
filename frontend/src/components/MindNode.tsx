import React from "react";
import type { NodeType } from "../types/nodeTypes";
import { NODE_TYPE_COLORS, NODE_TYPE_ICONS } from "../constants/nodeDefaults";
import { isColorDark } from "../utils/colorUtils";
import { useDrag } from "../hooks/useDrag";

interface Position {
  x: number;
  y: number;
}

interface Callbacks {
  onUpdate: (
    id: string,
    updates: Partial<{ title: string; x: number; y: number; color: string }>
  ) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
}

interface ConnectionState {
  isConnecting: boolean;
  isSource: boolean;
  isTarget: boolean;
  isAlreadyConnected: boolean;
}

interface MindNodeProps {
  id: string;
  title: string;
  position: Position;
  color?: string;
  type: NodeType;
  callbacks: Callbacks;
  connectionState: ConnectionState;
  onDrag?: (id: string, x: number, y: number) => void;
}

const MindNode: React.FC<MindNodeProps> = ({
  id,
  title,
  position,
  color,
  type,
  callbacks,
  connectionState,
  onDrag,
}) => {
  const nodeColor = color || NODE_TYPE_COLORS[type];
  const isDark = isColorDark(nodeColor);

  const { nodeRef, handleMouseDown, isDragging } = useDrag({
    initialX: position.x,
    initialY: position.y,
    onDrag: (x, y) => {
      if (onDrag) {
        onDrag(id, x, y);
      }
    },
    onDragEnd: (x, y) => {
      callbacks.onUpdate(id, { x, y });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      if (connectionState.isConnecting) {
        if (connectionState.isSource) {
          callbacks.onConnectStart("");
        } else {
          callbacks.onConnectEnd(id);
        }
      } else {
        if (e.shiftKey) {
          callbacks.onConnectStart(id);
        }
      }
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-move select-none group transition-opacity duration-200 ${
        connectionState.isConnecting && !connectionState.isSource && !connectionState.isTarget ? "opacity-50" : "opacity-100"
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={(e) => callbacks.onContextMenu(e, id)}
      onMouseEnter={() => callbacks.onHoverStart(id)}
      onMouseLeave={callbacks.onHoverEnd}
      title={connectionState.isAlreadyConnected ? "Conexão proibida" : connectionState.isConnecting && !connectionState.isSource ? "Clique para conectar" : undefined}
    >
      <div
        className={`relative flex rounded-xl shadow-2xl border-2 border-white/20 bg-card/90 backdrop-blur-md transition-all duration-200 hover:shadow-3xl hover:scale-105 ${
          connectionState.isTarget ? "ring-4 ring-blue-500 ring-opacity-75" : ""
        } ${
          connectionState.isAlreadyConnected ? "ring-6 ring-red-500 ring-opacity-100 cursor-not-allowed" : ""
        }`}
        style={{ backgroundColor: nodeColor, boxShadow: `0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)` }}
      >
        <div className="flex items-center justify-center w-12 bg-gradient-to-b from-white/40 to-white/20 border-r-2 border-white/60 rounded-l-xl shadow-inner">
          <span className="text-xl drop-shadow-lg filter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{NODE_TYPE_ICONS[type]}</span>
        </div>
        <div className="flex-1 px-4 py-3">
          <span className={`font-medium select-none ${isDark ? 'text-white' : 'text-black'}`}>{title}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            callbacks.onDelete(id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/80 flex items-center justify-center text-sm font-bold shadow-md"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default MindNode;
