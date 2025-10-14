import React, { useState } from "react";

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
}

const MindNode: React.FC<MindNodeProps> = ({
  id,
  title,
  x,
  y,
  color = "#3B82F6",
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - x, y: e.clientY - y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onUpdate(id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  return (
    <div
      className="absolute cursor-move select-none"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="px-4 py-2 rounded-lg shadow-lg border-2 border-white"
        style={{ backgroundColor: color }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyPress={handleKeyPress}
            className="bg-transparent outline-none text-white placeholder-white"
            autoFocus
          />
        ) : (
          <span className="text-white font-medium">{title}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="ml-2 text-white hover:text-red-300"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default MindNode;
