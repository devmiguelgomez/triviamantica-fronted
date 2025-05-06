import React, { useState } from 'react';
import StudyAssistant from './components/StudyAssistant';
import Header from './components/Header';
import AccessibilityCursor from './components/AccessibilityCursor';
import EnableCursor from './components/EnableCursor';
import ApiStatusMonitor from './components/ApiStatusMonitor';
import './App.css';

function App() {
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 flex flex-col">
      {/* Mostrar el cursor personalizado solo cuando está activado */}
      {customCursorEnabled && <AccessibilityCursor />}
      
      {/* Control para activar/desactivar el cursor personalizado */}
      <EnableCursor onToggle={setCustomCursorEnabled} />
      
      {/* Monitor del estado de la API */}
      <ApiStatusMonitor />
      
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-6">
            Tu Asistente Personal de Estudio
          </h1>
          
          <StudyAssistant />
        </div>
        
        <p className="text-center text-indigo-600 font-medium text-sm mt-8">
          Usa el poder de la IA para mejorar tu aprendizaje
        </p>
      </div>
    </div>
  );
}

export default App;
