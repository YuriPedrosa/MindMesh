import React, { useRef, useEffect, useState } from "react";
import { useMindNodeStore } from "../store/mindNodeStore";
import MindMapCanvas from "./MindMapCanvas";
import MindMapNodes from "./MindMapNodes";
import MindMapEditors from "./MindMapEditors";
import type { NodeType } from "../types/nodeTypes";

const MindMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, addNode, updateNode, removeNode, fetchNodes, connectNodes } =
    useMindNodeStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isEditEditorOpen, setIsEditEditorOpen] = useState(false);
  const [editNodeData, setEditNodeData] = useState<{
    id: string;
    title: string;
    color: string;
    type: NodeType;
    x: number;
    y: number;
  } | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [draggedPositions, setDraggedPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const links = nodes.flatMap(
    (node) =>
      node.connectionIds
        ?.map((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          if (!target) return null;

          const sourcePos = draggedPositions[node.id.toString()] || { x: node.x, y: node.y };
          const targetPos = draggedPositions[target.id.toString()] || { x: target.x, y: target.y };

          return {
            source: { ...node, x: sourcePos.x, y: sourcePos.y },
            target: { ...target, x: targetPos.x, y: targetPos.y }
          };
        })
        .filter(Boolean) || []
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isConnecting) {
      setIsConnecting(false);
      setSourceNodeId(null);
      return;
    }

    if (isEditEditorOpen) {
      setIsEditEditorOpen(false);
      setEditNodeData(null);
      return;
    }

    if (isContextMenuOpen) {
      setIsContextMenuOpen(false);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickPosition({ x, y });
    setIsEditorOpen(true);
  };

  const handleEditorSave = (config: {
    title: string;
    color: string;
    type: NodeType;
  }) => {
    addNode({
      title: config.title,
      x: clickPosition.x,
      y: clickPosition.y,
      color: config.color,
      type: config.type,
    });
    setIsEditorOpen(false);
  };

  const handleEditorCancel = () => {
    setIsEditorOpen(false);
  };

  const handleEditNode = (id: string) => {
    const node = nodes.find(n => n.id.toString() === id);
    if (node) {
      const draggedPos = draggedPositions[node.id.toString()];
      setEditNodeData({
        id: node.id.toString(),
        title: node.title,
        color: node.color || "",
        type: node.type,
        x: draggedPos ? draggedPos.x : node.x,
        y: draggedPos ? draggedPos.y : node.y,
      });
      setIsEditEditorOpen(true);
    }
  };

  const handleEditSave = (id: string, config: { title: string; color: string; type: NodeType }) => {
    updateNode(parseInt(id), config);
    setIsEditEditorOpen(false);
    setEditNodeData(null);
  };

  const handleEditCancel = () => {
    setIsEditEditorOpen(false);
    setEditNodeData(null);
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuNodeId(nodeId);
    setIsContextMenuOpen(true);
  };

  const handleContextMenuEdit = () => {
    if (contextMenuNodeId) {
      handleEditNode(contextMenuNodeId);
    }
  };

  const handleContextMenuDelete = () => {
    if (contextMenuNodeId) {
      removeNode(parseInt(contextMenuNodeId));
    }
  };

  const handleContextMenuConnect = () => {
    if (contextMenuNodeId) {
      handleConnectStart(contextMenuNodeId);
    }
  };

  const handleContextMenuClose = () => {
    setIsContextMenuOpen(false);
    setContextMenuNodeId(null);
  };

  const handleConnectStart = (id: string) => {
    if (id) {
      setIsConnecting(true);
      setSourceNodeId(id);
    } else {
      setIsConnecting(false);
      setSourceNodeId(null);
    }
  };

  const handleNodeDrag = (id: string, x: number, y: number) => {
    setDraggedPositions(prev => ({
      ...prev,
      [id]: { x, y }
    }));
  };

  const handleConnectEnd = (targetId: string) => {
    const sourceNode = nodes.find(n => n.id.toString() === sourceNodeId);
    const alreadyConnected = sourceNode?.connectionIds?.includes(parseInt(targetId)) || false;
    if (sourceNodeId && sourceNodeId !== targetId && !alreadyConnected) {
      connectNodes(parseInt(sourceNodeId), parseInt(targetId));
    }
    setIsConnecting(false);
    setSourceNodeId(null);
  };

  const handleNodeHoverStart = (id: string) => {
    if (isConnecting && id !== sourceNodeId) {
      setHoveredNodeId(id);
    }
  };

  const handleNodeHoverEnd = () => {
    setHoveredNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isConnecting) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const sourceNode = sourceNodeId ? nodes.find(n => n.id.toString() === sourceNodeId) : null;



  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isConnecting) {
        setIsConnecting(false);
        setSourceNodeId(null);
      }
    }
  };

  return (
    <div
      className="relative w-full h-full bg-transparent overflow-hidden"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <MindMapCanvas
        svgRef={svgRef}
        links={links}
        isConnecting={isConnecting}
        sourceNode={sourceNode}
        mousePosition={mousePosition}
      />
      <MindMapNodes
        nodes={nodes}
        draggedPositions={draggedPositions}
        isConnecting={isConnecting}
        sourceNodeId={sourceNodeId}
        hoveredNodeId={hoveredNodeId}
        sourceNode={sourceNode}
        onUpdate={(id, updates) => updateNode(parseInt(id), updates)}
        onEdit={handleEditNode}
        onDelete={(id) => removeNode(parseInt(id))}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onContextMenu={handleContextMenu}
        onHoverStart={handleNodeHoverStart}
        onHoverEnd={handleNodeHoverEnd}
        onDrag={handleNodeDrag}
      />
      <MindMapEditors
        isEditorOpen={isEditorOpen}
        clickPosition={clickPosition}
        onEditorSave={handleEditorSave}
        onEditorCancel={handleEditorCancel}
        isEditEditorOpen={isEditEditorOpen}
        editNodeData={editNodeData}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        isContextMenuOpen={isContextMenuOpen}
        contextMenuPosition={contextMenuPosition}
        onContextMenuEdit={handleContextMenuEdit}
        onContextMenuDelete={handleContextMenuDelete}
        onContextMenuConnect={handleContextMenuConnect}
        onContextMenuClose={handleContextMenuClose}
      />
    </div>
  );
};

export default MindMap;
