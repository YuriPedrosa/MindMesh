import { create } from 'zustand'
import type { NodeType } from '../types/nodeTypes'
import { DEFAULT_NODE_TYPE } from '../constants/nodeDefaults'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'

export interface MindNode {
  id: number
  title: string
  x: number
  y: number
  color?: string
  type: NodeType
  connectionIds?: number[]
}

interface MindNodeStore {
  nodes: MindNode[]
  isLoading: boolean
  isInitialLoading: boolean
  error: string | null
  stompClient: Client | null
  fetchNodes: () => Promise<void>
  addNode: (node: Omit<MindNode, 'id'>) => Promise<void>
  updateNode: (id: number, updates: Partial<MindNode>) => Promise<void>
  removeNode: (id: number) => Promise<void>
  connectNodes: (fromId: number, toId: number) => Promise<void>
  connectWebSocket: () => void
  disconnectWebSocket: () => void
}

const API_BASE_URL = 'http://localhost:8080/api'

export const useMindNodeStore = create<MindNodeStore>((set, get) => ({
  nodes: [],
  isLoading: false,
  isInitialLoading: false,
  error: null,
  stompClient: null,

  fetchNodes: async () => {
    set({ isInitialLoading: true, error: null })
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${API_BASE_URL}/nodes`)
        if (!response.ok) throw new Error('Failed to fetch nodes')
        const nodes = await response.json()
        set({ nodes, isInitialLoading: false })
        return
      } catch (error) {
        attempt++
        if (attempt >= maxRetries) {
          set({ error: (error as Error).message, isInitialLoading: false })
          toast.error('Failed to load nodes. Please try again.')
        } else {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
  },

  addNode: async (node) => {
    set({ isLoading: true, error: null })
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${API_BASE_URL}/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...node, type: node.type || DEFAULT_NODE_TYPE }),
        })
        if (!response.ok) throw new Error('Failed to add node')
        const newNode = await response.json()
        set((state) => ({ nodes: [...state.nodes, newNode], isLoading: false }))
        toast.success('Node added successfully!')
        return
      } catch (error) {
        attempt++
        if (attempt >= maxRetries) {
          set({ error: (error as Error).message, isLoading: false })
          toast.error('Failed to add node. Please try again.')
        } else {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
  },

  updateNode: async (id, updates) => {
    set({ isLoading: true, error: null })
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const currentNode = get().nodes.find((node) => node.id === id)
        if (!currentNode) throw new Error('Node not found')

        const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        if (!response.ok) throw new Error('Failed to update node')
        const updatedNode = await response.json()
        set((state) => ({
          nodes: state.nodes.map((node) => (node.id === id ? updatedNode : node)),
          isLoading: false,
        }))
        // Only show success toast if the update is not just position change
        const isPositionChangeOnly = Object.keys(updates).length === 2 &&
          'x' in updates && 'y' in updates
        if (!isPositionChangeOnly) {
          toast.success('Node updated successfully!')
        }
        return
      } catch (error) {
        attempt++
        if (attempt >= maxRetries) {
          set({ error: (error as Error).message, isLoading: false })
          toast.error('Failed to update node. Please try again.')
        } else {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
  },

  removeNode: async (id) => {
    set({ isLoading: true, error: null })
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete node')
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          isLoading: false,
        }))
        toast.success('Node deleted successfully!')
        return
      } catch (error) {
        attempt++
        if (attempt >= maxRetries) {
          set({ error: (error as Error).message, isLoading: false })
          toast.error('Failed to delete node. Please try again.')
        } else {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
  },

  connectNodes: async (sourceId, targetId) => {
    set({ isLoading: true, error: null })
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const stompClient = get().stompClient
        if (stompClient && stompClient.connected) {
          stompClient.publish({
            destination: '/app/connect',
            body: JSON.stringify({ sourceId, targetId }),
          })
        } else {
          // Fallback to REST if WebSocket not connected
          const response = await fetch(`${API_BASE_URL}/nodes/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceId, targetId }),
          })
          if (!response.ok) throw new Error('Failed to connect nodes')
          await get().fetchNodes()
        }
        set({ isLoading: false })
        toast.success('Nodes connected successfully!')
        return
      } catch (error) {
        attempt++
        if (attempt >= maxRetries) {
          set({ error: (error as Error).message, isLoading: false })
          toast.error('Failed to connect nodes. Please try again.')
        } else {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
  },

  connectWebSocket: () => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000, // Reconnect after 5 seconds if connection fails
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket')
        stompClient.subscribe('/topic/nodes', (message) => {
          const node = JSON.parse(message.body)
          if (node.deleted) {
            // Handle deletion
            set((state) => ({
              nodes: state.nodes.filter((n) => n.id !== parseInt(node.deleted)),
            }))
          } else {
            // Handle add/update
            set((state) => {
              const existingIndex = state.nodes.findIndex((n) => n.id === node.id)
              if (existingIndex >= 0) {
                // Update existing node
                const updatedNodes = [...state.nodes]
                updatedNodes[existingIndex] = node
                return { nodes: updatedNodes }
              } else {
                // Add new node
                return { nodes: [...state.nodes, node] }
              }
            })
          }
        })
        stompClient.subscribe('/topic/graph', (message) => {
          const nodes = JSON.parse(message.body)
          set({ nodes })
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'])
        console.error('Details:', frame.body)
        // Automatic reconnection is handled by the Client
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed, attempting to reconnect...')
      },
    })
    stompClient.activate()
    set({ stompClient })
  },

  disconnectWebSocket: () => {
    const stompClient = get().stompClient
    if (stompClient) {
      stompClient.deactivate()
      set({ stompClient: null })
    }
  },
}))
