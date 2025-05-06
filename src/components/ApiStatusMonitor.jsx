import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaServer, FaExclamationTriangle } from 'react-icons/fa';

const ApiStatusMonitor = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const checkApiStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://backend-gemini-one.vercel.app/api/chat/api-status');
      setApiStatus(response.data);
      setError(null);
    } catch (err) {
      setError('Error al verificar el estado de la API');
      console.error('Error al verificar estado de API:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar estado al cargar y cada 30 segundos
  useEffect(() => {
    checkApiStatus();
    
    const interval = setInterval(() => {
      checkApiStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading && !apiStatus) return null;
  
  if (error) return (
    <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md border border-red-200 z-40">
      <div className="flex items-center">
        <FaExclamationTriangle className="mr-2" />
        <span>Error al verificar el estado del servidor</span>
      </div>
    </div>
  );
  
  if (!apiStatus) return null;
  
  const { status, requestsThisMinute, minuteQuota, timeToReset } = apiStatus;
  const isLimited = status === 'limited';
  
  return (
    <div className={`fixed bottom-4 right-4 ${isLimited ? 'bg-amber-100' : 'bg-green-100'} px-4 py-2 rounded-lg shadow-md border ${isLimited ? 'border-amber-200' : 'border-green-200'} z-40`}>
      <div className="flex items-center text-sm">
        <FaServer className={`mr-2 ${isLimited ? 'text-amber-600' : 'text-green-600'}`} />
        <div>
          <div className={`font-medium ${isLimited ? 'text-amber-700' : 'text-green-700'}`}>
            {isLimited ? 'API: Alta demanda' : 'API: Disponible'}
          </div>
          <div className={`text-xs ${isLimited ? 'text-amber-600' : 'text-green-600'}`}>
            {isLimited 
              ? `Disponible en ~${Math.ceil(timeToReset / 1000)}s` 
              : `Uso: ${requestsThisMinute}/${minuteQuota} solicitudes/min (Flash)`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusMonitor;
