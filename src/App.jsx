import React, { useState } from 'react';
import StudyAssistant from './components/StudyAssistant';
import Header from './components/Header';
import AccessibilityCursor from './components/AccessibilityCursor';
import EnableCursor from './components/EnableCursor';
import ApiStatusMonitor from './components/ApiStatusMonitor';
import './App.css';
import { FaGraduationCap } from 'react-icons/fa';

function App() {
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
      {customCursorEnabled && <AccessibilityCursor />}
      
      <EnableCursor onToggle={setCustomCursorEnabled} />
      <ApiStatusMonitor />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* Encabezado principal de Triviamania */}
          <div className="bg-[#262454] text-white py-4 px-6 rounded-xl shadow-md mb-6 text-center">
            <div className="flex items-center justify-center">
              <FaGraduationCap className="text-2xl mr-2 text-[#9e61ff]" />
              <h1 className="text-2xl font-bold text-[#9e61ff]">Triviamania</h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Hecho con <span className="text-red-500">❤️</span> por Miguel Gomez
            </p>
          </div>
          
          <StudyAssistant />
        </div>
      </div>
    </div>
  );
}

export default App;
