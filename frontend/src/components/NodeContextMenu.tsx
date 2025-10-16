import React from "react";

interface NodeContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onConnect: () => void;
  onClose: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  onEdit,
  onDelete,
  onConnect,
  onClose,
}) => {
  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed z-50"
      style={{
        left: x,
        top: y,
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleClickOutside(e);
      }}
    >
      <div className="bg-card rounded-lg shadow-lg border border-border p-2 min-w-32">
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-destructive"
        >
          Deletar
        </button>
        <button
          onClick={() => {
            onConnect();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
        >
          Conectar
        </button>
      </div>
    </div>
  );
};

export default NodeContextMenu;
