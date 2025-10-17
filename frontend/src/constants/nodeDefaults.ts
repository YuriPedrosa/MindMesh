/**
 * Default values and constants for mind map nodes.
 * Defines standard colors, icons, and default properties for different node types.
 * Used throughout the application for consistent styling and behavior.
 *
 * @author Yuri Pedrosa
 */
import type { NodeType } from "../types/nodeTypes";

/** Default title for newly created nodes */
export const DEFAULT_NODE_TITLE = "Novo Nó";
/** Default color for nodes when no specific color is set */
export const DEFAULT_NODE_COLOR = "#3B82F6";
/** Default node type for new nodes */
export const DEFAULT_NODE_TYPE: NodeType = "IDEA";

/** Color mapping for different node types */
export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  IDEA: "#3B82F6",
  NOTE: "#10B981",
  TASK: "#F59E0B",
  QUESTION: "#EF4444",
  DECISION: "#8B5CF6",
  REFERENCE: "#6B7280",
};

/** Icon mapping for different node types */
export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  IDEA: "💡",
  NOTE: "📝",
  TASK: "✅",
  QUESTION: "🤔",
  DECISION: "⚖️",
  REFERENCE: "🔗",
};
