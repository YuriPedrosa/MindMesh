import React, { useState, useEffect } from "react";
import type { NodeType } from "../types/nodeTypes";
import { NODE_TYPE_COLORS } from "../constants/nodeDefaults";

interface EditNodeEditorProps {
  id: string;
  title: string;
  color: string;
  type: NodeType;
  x: number;
  y: number;
  onSave: (id: string, config: { title: string; color: string; type: NodeType }) => void;
  onCancel: () => void;
}

const EditNodeEditor: React.FC<EditNodeEditorProps> = ({
  id,
  title,
  color,
  type,
  x,
  y,
  onSave,
  onCancel,
}) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editColor, setEditColor] = useState(color);
  const [editType, setEditType] = useState<NodeType>(type);

  useEffect(() => {
    setEditTitle(title);
    setEditColor(color);
    setEditType(type);
  }, [title, color, type]);

  useEffect(() => {
    setEditColor(NODE_TYPE_COLORS[editType]);
  }, [editType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(id, { title: editTitle, color: editColor, type: editType });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };
  
  return (
    <div
      className="absolute z-50"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        handleClickOutside(e);
      }}
    >
      <div
        className="bg-card rounded-lg shadow-lg border border-border p-4 min-w-64"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-center font-medium"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-8 h-8 border border-input rounded cursor-pointer"
            />
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as NodeType)}
              className="px-2 py-1 border border-input rounded-md text-sm bg-background text-foreground"
            >
              <option value="IDEA">Ideia</option>
              <option value="TASK">Tarefa</option>
              <option value="NOTE">Nota</option>
              <option value="QUESTION">Pergunta</option>
              <option value="DECISION">Decisão</option>
              <option value="REFERENCE">Referência</option>
            </select>
          </div>
          <div className="flex justify-center space-x-2">
            <button
              type="submit"
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-muted-foreground border border-border rounded-md hover:bg-accent text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNodeEditor;
