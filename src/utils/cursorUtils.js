/**
 * Utilidades para mejorar la experiencia del cursor
 */

/**
 * Aplicar el cursor personalizado al cuerpo del documento
 * @param {boolean} enabled Si el cursor personalizado está activado
 */
export const toggleCustomCursor = (enabled) => {
  if (enabled) {
    document.body.classList.add('custom-cursor-enabled');
  } else {
    document.body.classList.remove('custom-cursor-enabled');
  }
};

/**
 * Prevenir comportamientos extraños del cursor
 */
export const preventCursorIssues = () => {
  // Desactivar eventos de "text selection" que pueden interferir con el cursor
  document.addEventListener('selectstart', (e) => {
    if (e.target.tagName !== 'INPUT' && 
        e.target.tagName !== 'TEXTAREA' && 
        e.target.contentEditable !== 'true') {
      e.preventDefault();
    }
  });
  
  // Asegurar que no haya animaciones agresivas durante el movimiento del ratón
  let isMoving = false;
  let moveTimeout;
  
  document.addEventListener('mousemove', () => {
    isMoving = true;
    document.body.classList.add('cursor-moving');
    
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      isMoving = false;
      document.body.classList.remove('cursor-moving');
    }, 100);
  });
  
  // Prevenir cambios de cursor por defecto
  document.addEventListener('mouseover', (e) => {
    if (document.body.classList.contains('custom-cursor-enabled')) {
      if (getComputedStyle(e.target).cursor !== 'none') {
        e.target.dataset.originalCursor = getComputedStyle(e.target).cursor;
        e.target.style.cursor = 'none';
      }
    }
  });
};

/**
 * Inicializar las mejoras de cursor cuando se carga el documento
 */
export const initCursorEnhancements = () => {
  // Verificar si el cursor personalizado está habilitado
  const customCursorEnabled = localStorage.getItem('customCursorEnabled') === 'true';
  toggleCustomCursor(customCursorEnabled);
  
  // Aplicar prevenciones de problemas de cursor
  preventCursorIssues();
  
  // Añadir clases para reducir problemas de cursor en dispositivos táctiles
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('touch-device');
  }
};

// Ejecutar inicialización automáticamente
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initCursorEnhancements);
}
