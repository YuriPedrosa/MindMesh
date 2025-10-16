import type { MindNode } from '../store/mindNodeStore';

export const getNodePosition = (node: MindNode, draggedPositions: Record<string, { x: number; y: number }>) => {
  const draggedPos = draggedPositions[node.id.toString()];
  return draggedPos || { x: node.x, y: node.y };
};

export const getConnectionState = (
  node: MindNode,
  isConnecting: boolean,
  sourceNodeId: string | null,
  hoveredNodeId: string | null,
  sourceNode: MindNode | null | undefined
) => {
  const isAlreadyConnected = Boolean(
    isConnecting &&
    sourceNodeId !== node.id.toString() &&
    (sourceNode?.connectionIds?.includes(node.id) || node.connectionIds?.includes(sourceNode?.id || 0))
  );
  return {
    isConnecting,
    isSource: sourceNodeId === node.id.toString(),
    isTarget: hoveredNodeId === node.id.toString(),
    isAlreadyConnected,
  };
};
