import { useState } from 'react';
import { FaAccessibleIcon, FaFont, FaCog, FaMousePointer, FaKeyboard } from 'react-icons/fa';

const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // porcentaje
  const [highContrast, setHighContrast] = useState(false);
  const [cursorSize, setCursorSize] = useState('medium');
  const [keyboardMode, setKeyboardMode] = useState(false);

  // Aplicar cambios de accesibilidad
  const applyAccessibilitySettings = () => {
    // Tamaño de fuente
    document.documentElement.style.fontSize = `${fontSize}%`;
    
    // Contraste alto
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Tamaño del cursor
    document.body.setAttribute('data-cursor-size', cursorSize);
    
    // Modo de teclado
    if (keyboardMode) {
      document.body.classList.add('keyboard-navigation');
    } else {
      document.body.classList.remove('keyboard-navigation');
    }
  };

  // Aplicar configuraciones al montar y cuando cambian
  useState(() => {
    applyAccessibilitySettings();
  }, [fontSize, highContrast, cursorSize, keyboardMode]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante de accesibilidad */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Controles de accesibilidad"
      >
        <FaAccessibleIcon size={24} />
      </button>
      
      {/* Panel de opciones */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white p-4 rounded-lg shadow-xl border border-indigo-100 w-64">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
            <FaCog className="mr-2" /> Accesibilidad
          </h3>
          
          {/* Tamaño de fuente */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaFont className="mr-1" /> Tamaño de texto
            </label>
            <div className="flex items-center">
              <button 
                onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm"
                aria-label="Disminuir tamaño de texto"
              >
                A-
              </button>
              <div className="flex-1 mx-2 text-center text-sm">
                {fontSize}%
              </div>
              <button 
                onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm"
                aria-label="Aumentar tamaño de texto"
              >
                A+
              </button>
            </div>
          </div>
          
          {/* Cursor grande */}
          <div className="mb-3">
            <label className="flex items-center justify-between text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <FaMousePointer className="mr-1" /> Tamaño del cursor
              </div>
              <select 
                value={cursorSize}
                onChange={(e) => setCursorSize(e.target.value)}
                className="ml-2 text-sm border rounded p-1"
              >
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </label>
          </div>
          
          {/* Contraste alto */}
          <div className="mb-3">
            <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={() => setHighContrast(!highContrast)}
                className="mr-2 h-4 w-4 text-indigo-600 rounded"
              />
              Alto contraste
            </label>
          </div>
          
          {/* Navegación por teclado */}
          <div className="mb-3">
            <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={keyboardMode}
                onChange={() => setKeyboardMode(!keyboardMode)}
                className="mr-2 h-4 w-4 text-indigo-600 rounded"
              />
              <FaKeyboard className="mr-1" /> Modo navegación por teclado
            </label>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Presiona ESC para cerrar este panel
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityControls;
