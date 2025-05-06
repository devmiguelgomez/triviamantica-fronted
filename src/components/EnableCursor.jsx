import { useState, useEffect } from 'react';
import { FaMousePointer, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toggleCustomCursor } from '../utils/cursorUtils';

const EnableCursor = ({ onToggle }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Verificar si ya hay una preferencia guardada
    const savedPreference = localStorage.getItem('customCursorEnabled');
    if (savedPreference) {
      const enabled = savedPreference === 'true';
      setIsEnabled(enabled);
      onToggle(enabled);
    }
  }, [onToggle]);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('customCursorEnabled', newState.toString());
    toggleCustomCursor(newState);
    onToggle(newState);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleToggle}
        className="flex items-center bg-white border border-indigo-200 px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
        title={isEnabled ? "Desactivar cursor personalizado" : "Activar cursor personalizado"}
      >
        <FaMousePointer className="text-indigo-600 mr-2" />
        <span className="text-indigo-700 font-medium mr-1">Cursor:</span>
        {isEnabled ? (
          <FaToggleOn className="text-2xl text-indigo-600" />
        ) : (
          <FaToggleOff className="text-2xl text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default EnableCursor;
