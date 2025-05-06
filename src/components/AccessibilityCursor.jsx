import { useState, useEffect } from 'react';

const AccessibilityCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorType, setCursorType] = useState('default');
  const [lockPosition, setLockPosition] = useState(false);

  // Seguir la posición del mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (lockPosition) return;
      
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => {
      setIsClicking(false);
      // Breve bloqueo para evitar movimiento inmediato después del clic
      setLockPosition(true);
      setTimeout(() => setLockPosition(false), 100);
    };

    // Ocultar cursor cuando el mouse sale de la ventana
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    
    // Detectar elementos interactivos para cambiar el tipo de cursor
    const handleMouseOver = (e) => {
      const targetElement = e.target;
      
      if (targetElement.tagName === 'BUTTON' || 
          targetElement.tagName === 'A' || 
          targetElement.role === 'button' ||
          targetElement.classList.contains('cursor-pointer')) {
        setCursorType('pointer');
      } else if (targetElement.tagName === 'INPUT' || 
                 targetElement.tagName === 'TEXTAREA' || 
                 targetElement.contentEditable === 'true') {
        setCursorType('text');
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    // Ocultar el cursor nativo del sistema
    document.body.style.cursor = 'none';
    
    // Asegurarnos de que todos los elementos usen el mismo cursor
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
      document.head.removeChild(styleTag);
    };
  }, [lockPosition]);

  if (!isVisible) return null;

  // Determinar el tamaño y estilo del cursor según el tipo
  const getCursorStyles = () => {
    const baseStyles = {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 9999,
      transform: 'translate(-50%, -50%)',
      transition: isClicking ? 'none' : 'all 0.05s linear',
      top: position.y,
      left: position.x,
    };
    
    switch (cursorType) {
      case 'pointer':
        return {
          ...baseStyles,
          width: isClicking ? '24px' : '28px',
          height: isClicking ? '24px' : '28px',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          border: '2px solid rgba(99, 102, 241, 0.8)',
          borderRadius: '50%',
        };
      case 'text':
        return {
          ...baseStyles,
          width: '3px',
          height: '24px',
          backgroundColor: '#6366f1',
          borderRadius: '1px',
          opacity: isClicking ? 0.5 : 0.8,
        };
      default:
        return {
          ...baseStyles,
          width: isClicking ? '8px' : '12px',
          height: isClicking ? '8px' : '12px',
          backgroundColor: isClicking ? '#4F46E5' : '#6366f1',
          borderRadius: '50%',
          opacity: 0.8,
        };
    }
  };

  return (
    <>
      {/* Cursor exterior (para indicar hover) */}
      {cursorType === 'pointer' && (
        <div
          style={{
            ...getCursorStyles(),
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            width: '40px',
            height: '40px',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '50%',
          }}
        />
      )}
      
      {/* Cursor principal */}
      <div style={getCursorStyles()} />
    </>
  );
};

export default AccessibilityCursor;
