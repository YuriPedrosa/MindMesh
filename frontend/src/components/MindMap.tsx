import React, { useRef, useEffect, useState } from "react";
import { useMindNodeStore } from "../store/mindNodeStore";
import MindMapCanvas from "./MindMapCanvas";
import MindMapNodes from "./MindMapNodes";
import MindMapEditors from "./MindMapEditors";
import type { NodeType } from "../types/nodeTypes";

interface MindMapState {
  isEditorOpen: boolean;
  clickPosition: { x: number; y: number };
  isEditEditorOpen: boolean;
  editNodeData: {
    id: string;
    title: string;
    color: string;
    type: NodeType;
    x: number;
    y: number;
  } | null;
  isContextMenuOpen: boolean;
  contextMenuPosition: { x: number; y: number };
  contextMenuNodeId: string | null;
  isConnecting: boolean;
  sourceNodeId: string | null;
  mousePosition: { x: number; y: number };
  draggedPositions: Record<string, { x: number; y: number }>;
  hoveredNodeId: string | null;
}

const MindMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, addNode, updateNode, removeNode, fetchNodes, connectNodes } =
    useMindNodeStore();

  const [state, setState] = useState<MindMapState>({
    isEditorOpen: false,
    clickPosition: { x: 0, y: 0 },
    isEditEditorOpen: false,
    editNodeData: null,
    isContextMenuOpen: false,
    contextMenuPosition: { x: 0, y: 0 },
    contextMenuNodeId: null,
    isConnecting: false,
    sourceNodeId: null,
    mousePosition: { x: 0, y: 0 },
    draggedPositions: {},
    hoveredNodeId: null,
  });

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const links = nodes.flatMap(
    (node) =>
      node.connectionIds
        ?.map((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          if (!target) return null;

          const sourcePos = state.draggedPositions[node.id.toString()] || { x: node.x, y: node.y };
          const targetPos = state.draggedPositions[target.id.toString()] || { x: target.x, y: target.y };

          return {
            source: { ...node, x: sourcePos.x, y: sourcePos.y },
            target: { ...target, x: targetPos.x, y: targetPos.y }
          };
        })
        .filter(Boolean) || []
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (state.isConnecting) {
      setState(prev => ({ ...prev, isConnecting: false, sourceNodeId: null }));
      return;
    }

    if (state.isEditEditorOpen) {
      setState(prev => ({ ...prev, isEditEditorOpen: false, editNodeData: null }));
      return;
    }

    if (state.isContextMenuOpen) {
      setState(prev => ({ ...prev, isContextMenuOpen: false }));
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setState(prev => ({ ...prev, clickPosition: { x, y }, isEditorOpen: true }));
  };

  const handleEditorSave = (config: {
    title: string;
    color: string;
    type: NodeType;
  }) => {
    addNode({
      title: config.title,
      x: state.clickPosition.x,
      y: state.clickPosition.y,
      color: config.color,
      type: config.type,
    });
    setState(prev => ({ ...prev, isEditorOpen: false }));
  };

  const handleEditorCancel = () => {
    setState(prev => ({ ...prev, isEditorOpen: false }));
  };

  const handleEditNode = (id: string) => {
    const node = nodes.find(n => n.id.toString() === id);
    if (node) {
      const draggedPos = state.draggedPositions[node.id.toString()];
      setState(prev => ({
        ...prev,
        editNodeData: {
          id: node.id.toString(),
          title: node.title,
          color: node.color || "",
          type: node.type,
          x: draggedPos ? draggedPos.x : node.x,
          y: draggedPos ? draggedPos.y : node.y,
        },
        isEditEditorOpen: true,
      }));
    }
  };

  const handleEditSave = (id: string, config: { title: string; color: string; type: NodeType }) => {
    updateNode(parseInt(id), config);
    setState(prev => ({ ...prev, isEditEditorOpen: false, editNodeData: null }));
  };

  const handleEditCancel = () => {
    setState(prev => ({ ...prev, isEditEditorOpen: false, editNodeData: null }));
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      contextMenuPosition: { x: e.clientX, y: e.clientY },
      contextMenuNodeId: nodeId,
      isContextMenuOpen: true,
    }));
  };

  const handleContextMenuEdit = () => {
    if (state.contextMenuNodeId) {
      handleEditNode(state.contextMenuNodeId);
    }
  };

  const handleContextMenuDelete = () => {
    if (state.contextMenuNodeId) {
      removeNode(parseInt(state.contextMenuNodeId));
    }
  };

  const handleContextMenuConnect = () => {
    if (state.contextMenuNodeId) {
      handleConnectStart(state.contextMenuNodeId);
    }
  };

  const handleContextMenuClose = () => {
    setState(prev => ({ ...prev, isContextMenuOpen: false, contextMenuNodeId: null }));
  };

  const handleConnectStart = (id: string) => {
    if (id) {
      setState(prev => ({ ...prev, isConnecting: true, sourceNodeId: id }));
    } else {
      setState(prev => ({ ...prev, isConnecting: false, sourceNodeId: null }));
    }
  };

  const handleNodeDrag = (id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      draggedPositions: {
        ...prev.draggedPositions,
        [id]: { x, y }
      }
    }));
  };

  const handleConnectEnd = (targetId: string) => {
    const sourceNode = nodes.find(n => n.id.toString() === state.sourceNodeId);
    const alreadyConnected = sourceNode?.connectionIds?.includes(parseInt(targetId)) || false;
    if (state.sourceNodeId && state.sourceNodeId !== targetId && !alreadyConnected) {
      connectNodes(parseInt(state.sourceNodeId), parseInt(targetId));
    }
    setState(prev => ({ ...prev, isConnecting: false, sourceNodeId: null }));
  };

  const handleNodeHoverStart = (id: string) => {
    if (state.isConnecting && id !== state.sourceNodeId) {
      setState(prev => ({ ...prev, hoveredNodeId: id }));
    }
  };

  const handleNodeHoverEnd = () => {
    setState(prev => ({ ...prev, hoveredNodeId: null }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (state.isConnecting) {
      const rect = e.currentTarget.getBoundingClientRect();
      setState(prev => ({
        ...prev,
        mousePosition: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }));
    }
  };

  const sourceNode = state.sourceNodeId ? nodes.find(n => n.id.toString() === state.sourceNodeId) : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (state.isConnecting) {
        setState(prev => ({ ...prev, isConnecting: false, sourceNodeId: null }));
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
        isConnecting={state.isConnecting}
        sourceNode={sourceNode}
        mousePosition={state.mousePosition}
      />
      <MindMapNodes
        nodes={nodes}
        draggedPositions={state.draggedPositions}
        isConnecting={state.isConnecting}
        sourceNodeId={state.sourceNodeId}
        hoveredNodeId={state.hoveredNodeId}
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
        isEditorOpen={state.isEditorOpen}
        clickPosition={state.clickPosition}
        onEditorSave={handleEditorSave}
        onEditorCancel={handleEditorCancel}
        isEditEditorOpen={state.isEditEditorOpen}
        editNodeData={state.editNodeData}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        isContextMenuOpen={state.isContextMenuOpen}
        contextMenuPosition={state.contextMenuPosition}
        onContextMenuEdit={handleContextMenuEdit}
        onContextMenuDelete={handleContextMenuDelete}
        onContextMenuConnect={handleContextMenuConnect}
        onContextMenuClose={handleContextMenuClose}
      />
    </div>
  );
};

export default MindMap;
