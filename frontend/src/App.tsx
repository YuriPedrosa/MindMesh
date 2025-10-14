import React from "react";
import MindMap from "./components/MindMap";

const App: React.FC = () => {
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">MindMesh</h1>
            <div className="text-sm text-gray-500">
              Clique no canvas para adicionar nós • Arraste para mover • Duplo
              clique para editar
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <MindMap />
      </main>
    </div>
  );
};

export default App;
