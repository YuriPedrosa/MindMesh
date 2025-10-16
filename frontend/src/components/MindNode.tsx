import React, { useState, useEffect, useRef } from "react";
import type { NodeType } from "../types/nodeTypes";
import { NODE_TYPE_COLORS, NODE_TYPE_ICONS } from "../constants/nodeDefaults";

// Function to determine if a color is dark or light
const isColorDark = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

interface MindNodeProps {
  id: string;
  title: string;
  x: number;
  y: number;
  color?: string;
  type: NodeType;
  onUpdate: (
    id: string,
    updates: Partial<{ title: string; x: number; y: number; color: string }>
  ) => void;
  onDelete: (id: string) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  isConnecting: boolean;
  isSource: boolean;
  isTarget: boolean;
  onDrag?: (id: string, x: number, y: number) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
}

const MindNode: React.FC<MindNodeProps> = ({
  id,
  title,
  x,
  y,
  color,
  type,
  onUpdate,
  onDelete,
  onConnectStart,
  onConnectEnd,
  isConnecting,
  isSource,
  isTarget,
  onDrag,
  onHoverStart,
  onHoverEnd,
}) => {
  const defaultColor = NODE_TYPE_COLORS[type];
  const nodeColor = color || defaultColor;
  const isDark = isColorDark(nodeColor);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x, y });
  const isDragging = useRef(false);

  useEffect(() => {
    currentPosition.current = { x, y };
    if (nodeRef.current) {
      nodeRef.current.style.left = `${x}px`;
      nodeRef.current.style.top = `${y}px`;
    }
  }, [x, y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = false;
    dragStart.current = {
      x: e.clientX - currentPosition.current.x,
      y: e.clientY - currentPosition.current.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      isDragging.current = true;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      currentPosition.current = { x: newX, y: newY };
      if (nodeRef.current) {
        nodeRef.current.style.left = `${newX}px`;
        nodeRef.current.style.top = `${newY}px`;
      }
      // Call onDrag callback if provided
      if (onDrag) {
        onDrag(id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        // Update the node position through onUpdate
        onUpdate(id, {
          x: currentPosition.current.x,
          y: currentPosition.current.y,
        });
        // Clear dragged position to prevent flickering
        if (onDrag) {
          onDrag(id, currentPosition.current.x, currentPosition.current.y);
        }
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(id, { title: editTitle });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only handle connection clicks if not dragging
    if (!isDragging.current) {
      if (isConnecting) {
        if (isSource) {
          // Cancel connection
          onConnectStart("");
        } else {
          // Connect to this node
          onConnectEnd(id);
        }
      } else {
        // Start connection
        onConnectStart(id);
      }
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-move select-none group transition-opacity duration-200 ${
        isConnecting && !isSource && !isTarget ? "opacity-50" : "opacity-100"
      }`}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onMouseEnter={() => onHoverStart(id)}
      onMouseLeave={onHoverEnd}
    >
      <div
        className={`relative flex rounded-xl shadow-2xl border-2 border-white/20 bg-card/90 backdrop-blur-md transition-all duration-200 hover:shadow-3xl hover:scale-105 ${
          isTarget ? "ring-4 ring-blue-500 ring-opacity-75" : ""
        }`}
        style={{ backgroundColor: nodeColor, boxShadow: `0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)` }}
      >
        <div className="flex items-center justify-center w-12 bg-gradient-to-b from-white/40 to-white/20 border-r-2 border-white/60 rounded-l-xl shadow-inner">
          <span className="text-xl drop-shadow-lg filter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{NODE_TYPE_ICONS[type]}</span>
        </div>
        <div className="flex-1 px-4 py-3">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyPress={handleKeyPress}
              className="bg-transparent outline-none text-foreground placeholder-muted-foreground font-medium w-full"
              autoFocus
            />
          ) : (
            <span className={`font-medium select-none ${isDark ? 'text-white' : 'text-black'}`}>{title}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
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
