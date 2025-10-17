import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import MindMap from "./components/MindMap";
import { useMindNodeStore } from "./store/mindNodeStore";

/**
 * Main application component for MindMesh.
 * This is the root component that sets up the overall layout and manages
 * the WebSocket connection for real-time collaboration.
 *
 * Features:
 * - Header with application title and instructions
 * - Main content area with the mind map canvas
 * - Toast notifications for user feedback
 * - Automatic WebSocket connection management
 *
 * @author Yuri Pedrosa
 * @returns The root React component
 */
const App: React.FC = () => {
  const { connectWebSocket, disconnectWebSocket } = useMindNodeStore();

  // Establish WebSocket connection on mount and clean up on unmount
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col dark">
      {/* Application header with title and instructions */}
      <header className="bg-card shadow-sm border-b border-border flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-foreground">MindMesh</h1>
            <div className="text-sm text-muted-foreground">
              Clique no canvas para adicionar nós • Arraste para mover
            </div>
          </div>
        </div>
      </header>

      {/* Main content area containing the mind map */}
      <main className="flex-1 overflow-hidden bg-secondary">
        <MindMap />
      </main>

      {/* Toast notification container */}
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
