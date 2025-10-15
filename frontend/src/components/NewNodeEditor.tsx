import React, { useState } from "react";

interface NewNodeEditorProps {
  x: number;
  y: number;
  onSave: (config: { title: string; color: string; type: string }) => void;
  onCancel: () => void;
}

const NewNodeEditor: React.FC<NewNodeEditorProps> = ({
  x,
  y,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState("Novo Nó");
  const [color, setColor] = useState("#3B82F6");
  const [type, setType] = useState("IDEA");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, color, type });
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
        className="bg-white rounded-lg shadow-lg border-2 border-gray-300 p-4 min-w-64"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="IDEA">Ideia</option>
              <option value="TASK">Tarefa</option>
              <option value="NOTE">Nota</option>
            </select>
          </div>
          <div className="flex justify-center space-x-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Criar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewNodeEditor;
