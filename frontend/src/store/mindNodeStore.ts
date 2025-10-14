import { create } from 'zustand'

interface MindNode {
  id: string
  title: string
  x: number
  y: number
  color?: string
  connections?: string[]
}

interface MindNodeStore {
  nodes: MindNode[]
  addNode: (node: MindNode) => void
  updateNode: (id: string, updates: Partial<MindNode>) => void
  removeNode: (id: string) => void
}

export const useMindNodeStore = create<MindNodeStore>((set) => ({
  nodes: [],
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),
  removeNode: (id) =>
    set((state) => ({ nodes: state.nodes.filter((node) => node.id !== id) })),
}))
