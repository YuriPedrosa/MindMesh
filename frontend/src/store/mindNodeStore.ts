import { create } from 'zustand'

export interface MindNode {
  id: number
  title: string
  x: number
  y: number
  color?: string
  type: string
  connections?: number[]
}

interface MindNodeStore {
  nodes: MindNode[]
  isLoading: boolean
  error: string | null
  fetchNodes: () => Promise<void>
  addNode: (node: Omit<MindNode, 'id'>) => Promise<void>
  updateNode: (id: number, updates: Partial<MindNode>) => Promise<void>
  removeNode: (id: number) => Promise<void>
  connectNodes: (fromId: number, toId: number) => Promise<void>
}

const API_BASE_URL = 'http://localhost:8080/api'

export const useMindNodeStore = create<MindNodeStore>((set, get) => ({
  nodes: [],
  isLoading: false,
  error: null,

  fetchNodes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/nodes`)
      if (!response.ok) throw new Error('Failed to fetch nodes')
      const nodes = await response.json()
      set({ nodes, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addNode: async (node) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...node, type: node.type || 'IDEA' }),
      })
      if (!response.ok) throw new Error('Failed to add node')
      const newNode = await response.json()
      set((state) => ({ nodes: [...state.nodes, newNode], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateNode: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const currentNode = get().nodes.find((node) => node.id === id)
      if (!currentNode) throw new Error('Node not found')

      const fullUpdates = { ...currentNode, ...updates }
      const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullUpdates),
      })
      if (!response.ok) throw new Error('Failed to update node')
      const updatedNode = await response.json()
      set((state) => ({
        nodes: state.nodes.map((node) => (node.id === id ? updatedNode : node)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  removeNode: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete node')
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  connectNodes: async (fromId, toId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/nodes/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId }),
      })
      if (!response.ok) throw new Error('Failed to connect nodes')
      // Refresh nodes to get updated connections
      await get().fetchNodes()
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
