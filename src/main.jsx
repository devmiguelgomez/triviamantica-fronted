import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './cursor.css' // Importar estilos del cursor

try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error("No se encontró el elemento 'root' en el DOM");
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('✅ Aplicación React renderizada correctamente');
} catch (error) {
  console.error('❌ Error al inicializar la aplicación React:', error);
  
  // Mostrar el error en la pantalla para facilitar la depuración
  const rootElement = document.getElementById('root') || document.body;
  rootElement.innerHTML = `
    <div style="padding: 20px; margin: 20px; background-color: #ffdddd; border: 1px solid #ff6b6b; border-radius: 5px;">
      <h2 style="color: #d63031;">Error al inicializar la aplicación</h2>
      <pre style="background: #f8f8f8; padding: 10px; border-radius: 4px; overflow: auto;">${error.message}</pre>
    </div>
  `;
}
