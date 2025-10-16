import type { NodeType } from "../types/nodeTypes";

export const DEFAULT_NODE_TITLE = "Novo Nó";
export const DEFAULT_NODE_COLOR = "#3B82F6";
export const DEFAULT_NODE_TYPE: NodeType = "IDEA";

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  IDEA: "#3B82F6",
  NOTE: "#10B981",
  TASK: "#F59E0B",
  QUESTION: "#EF4444",
  DECISION: "#8B5CF6",
  REFERENCE: "#6B7280",
};

export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  IDEA: "💡",
  NOTE: "📝",
  TASK: "✅",
  QUESTION: "🤔",
  DECISION: "⚖️",
  REFERENCE: "🔗",
};
