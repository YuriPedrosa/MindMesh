import React, { useState, useEffect, useRef } from "react";

interface MindNodeProps {
  id: string;
  title: string;
  x: number;
  y: number;
  color?: string;
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
}

const MindNode: React.FC<MindNodeProps> = ({
  id,
  title,
  x,
  y,
  color = "#3B82F6",
  onUpdate,
  onDelete,
  onConnectStart,
  onConnectEnd,
  isConnecting,
  isSource,
  isTarget,
}) => {
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
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        onUpdate(id, {
          x: currentPosition.current.x,
          y: currentPosition.current.y,
        });
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
    >
      <div
        className="relative px-4 py-3 rounded-xl shadow-lg border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{ backgroundColor: color }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyPress={handleKeyPress}
            className="bg-transparent outline-none text-foreground placeholder-muted-foreground font-medium"
            autoFocus
          />
        ) : (
          <span className="text-foreground font-medium select-none">{title}</span>
        )}
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
