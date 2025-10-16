import React from "react";
import NewNodeEditor from "./NewNodeEditor";
import EditNodeEditor from "./EditNodeEditor";
import NodeContextMenu from "./NodeContextMenu";
import type { NodeType } from "../types/nodeTypes";

interface MindMapEditorsProps {
  isEditorOpen: boolean;
  clickPosition: { x: number; y: number };
  onEditorSave: (config: { title: string; color: string; type: NodeType }) => void;
  onEditorCancel: () => void;
  isEditEditorOpen: boolean;
  editNodeData: {
    id: string;
    title: string;
    color: string;
    type: NodeType;
    x: number;
    y: number;
  } | null;
  onEditSave: (id: string, config: { title: string; color: string; type: NodeType }) => void;
  onEditCancel: () => void;
  isContextMenuOpen: boolean;
  contextMenuPosition: { x: number; y: number };
  onContextMenuEdit: () => void;
  onContextMenuDelete: () => void;
  onContextMenuConnect: () => void;
  onContextMenuClose: () => void;
}

const MindMapEditors: React.FC<MindMapEditorsProps> = ({
  isEditorOpen,
  clickPosition,
  onEditorSave,
  onEditorCancel,
  isEditEditorOpen,
  editNodeData,
  onEditSave,
  onEditCancel,
  isContextMenuOpen,
  contextMenuPosition,
  onContextMenuEdit,
  onContextMenuDelete,
  onContextMenuConnect,
  onContextMenuClose,
}) => {
  return (
    <>
      {isEditorOpen && (
        <NewNodeEditor
          x={clickPosition.x}
          y={clickPosition.y}
          onSave={onEditorSave}
          onCancel={onEditorCancel}
        />
      )}
      {isEditEditorOpen && editNodeData && (
        <EditNodeEditor
          id={editNodeData.id}
          title={editNodeData.title}
          color={editNodeData.color}
          type={editNodeData.type}
          x={editNodeData.x}
          y={editNodeData.y}
          onSave={onEditSave}
          onCancel={onEditCancel}
        />
      )}
      {isContextMenuOpen && (
        <NodeContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onEdit={onContextMenuEdit}
          onDelete={onContextMenuDelete}
          onConnect={onContextMenuConnect}
          onClose={onContextMenuClose}
        />
      )}
    </>
  );
};

export default MindMapEditors;
