/**
 * Zustand store for managing mind map nodes and real-time collaboration.
 * This store handles all state management for the mind map application,
 * including CRUD operations, WebSocket communication, and user feedback.
 *
 * Features:
 * - State management for mind map nodes
 * - REST API integration with retry logic
 * - Real-time WebSocket updates using STOMP
 * - Error handling and user notifications
 * - Automatic reconnection for WebSocket
 *
 * @author Yuri Pedrosa
 */
import { create } from 'zustand'
import type { NodeType } from '../types/nodeTypes'
import { DEFAULT_NODE_TYPE } from '../constants/nodeDefaults'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'

/**
 * Interface representing a mind map node in the frontend store.
 * Contains all the properties needed for rendering and managing nodes in the UI.
 */
export interface MindNode {
  /** Unique identifier for the node */
  id: number
  /** Display title of the node */
  title: string
  /** X-coordinate position on the canvas */
  x: number
  /** Y-coordinate position on the canvas */
  y: number
  /** Optional color for visual customization */
  color?: string
  /** Type of the node (IDEA, NOTE, TASK, etc.) */
  type: NodeType
  /** Array of IDs of nodes this node is connected to */
  connectionIds?: number[]
}

/**
 * Interface for the Zustand store managing mind map nodes and WebSocket connections.
 * Provides methods for CRUD operations, real-time synchronization, and connection management.
 */
interface MindNodeStore {
  /** Array of all mind map nodes currently in the store */
  nodes: MindNode[]
  /** Flag indicating if any operation is currently loading */
  isLoading: boolean
  /** Flag for initial data loading state */
  isInitialLoading: boolean
  /** Error message if any operation failed */
  error: string | null
  /** STOMP WebSocket client for real-time communication */
  stompClient: Client | null
  /** Fetches all nodes from the backend API */
  fetchNodes: () => Promise<void>
  /** Adds a new node to the mind map */
  addNode: (node: Omit<MindNode, 'id'>) => Promise<void>
  /** Updates an existing node with partial data */
  updateNode: (id: number, updates: Partial<MindNode>) => Promise<void>
  /** Removes a node from the mind map */
  removeNode: (id: number) => Promise<void>
  /** Creates a connection between two nodes */
  connectNodes: (fromId: number, toId: number) => Promise<void>
  /** Establishes WebSocket connection for real-time updates */
  connectWebSocket: () => void
  /** Disconnects the WebSocket connection */
  disconnectWebSocket: () => void
}

/** Base URL for the backend API endpoints */
const API_BASE_URL = 'http://localhost:8080/api'

/**
 * Zustand store for managing mind map nodes and real-time collaboration.
 * Handles state management, API calls, and WebSocket communication.
 * Implements retry logic for failed operations and provides user feedback via toasts.
 */
export const useMindNodeStore = create<MindNodeStore>((set, get) => ({
  nodes: [],
  isLoading: false,
  isInitialLoading: false,
  error: null,
  stompClient: null,

  /**
   * Fetches all nodes from the backend API with retry logic.
   * Updates the store with the fetched nodes or sets an error state.
   */
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

  /**
   * Adds a new node to the mind map via API call with retry logic.
   * Updates the store with the new node and shows success feedback.
   *
   * @param node The node data to add (without ID)
   */
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

  /**
   * Updates an existing node with partial data via API call with retry logic.
   * Updates the store and shows success feedback (except for position-only changes).
   *
   * @param id The ID of the node to update
   * @param updates Partial node data to update
   */
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

  /**
   * Removes a node from the mind map via API call with retry logic.
   * Updates the store by filtering out the deleted node and shows success feedback.
   *
   * @param id The ID of the node to remove
   */
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

  /**
   * Creates a connection between two nodes, preferring WebSocket for real-time updates.
   * Falls back to REST API if WebSocket is not connected.
   * Updates the store and shows success feedback.
   *
   * @param sourceId The ID of the source node
   * @param targetId The ID of the target node
   */
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

  /**
   * Establishes a WebSocket connection using STOMP protocol for real-time collaboration.
   * Subscribes to node updates and graph changes, handling automatic reconnection.
   */
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

  /**
   * Disconnects the WebSocket connection and cleans up the client reference.
   */
  disconnectWebSocket: () => {
    const stompClient = get().stompClient
    if (stompClient) {
      stompClient.deactivate()
      set({ stompClient: null })
    }
  },
}))
