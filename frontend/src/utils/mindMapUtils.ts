/**
 * Utility functions for mind map operations and calculations.
 * Provides helper functions for node positioning, connection logic, and state management.
 * Used throughout the mind map components for consistent behavior.
 *
 * @author Yuri Pedrosa
 */
import type { MindNode } from '../store/mindNodeStore';

/**
 * Gets the current position of a node, considering any temporary drag positions.
 * Returns the dragged position if available, otherwise the node's stored position.
 *
 * @param node - The mind map node
 * @param draggedPositions - Map of temporary drag positions by node ID
 * @returns The current position of the node
 */
export const getNodePosition = (node: MindNode, draggedPositions: Record<string, { x: number; y: number }>) => {
  const draggedPos = draggedPositions[node.id.toString()];
  return draggedPos || { x: node.x, y: node.y };
};

/**
 * Determines the connection state for a node during the connection process.
 * Calculates whether the node is a valid connection target based on current state.
 *
 * @param node - The mind map node to check
 * @param isConnecting - Whether a connection is currently being made
 * @param sourceNodeId - ID of the source node in the connection
 * @param hoveredNodeId - ID of the currently hovered node
 * @param sourceNode - The source node object
 * @returns Object containing connection state flags
 */
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
