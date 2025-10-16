import React from "react";
import MindMap from "./components/MindMap";

const App: React.FC = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col dark">
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
      <main className="flex-1 overflow-hidden bg-secondary">
        <MindMap />
      </main>
    </div>
  );
};

export default App;
