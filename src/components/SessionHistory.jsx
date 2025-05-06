import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaCalendarAlt, FaTrash, FaArrowRight, FaTimes, FaSpinner } from 'react-icons/fa';

const SessionHistory = ({ onSelectSession, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('https://backend-gemini-one.vercel.app/api/chat/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error al cargar las sesiones:', error);
      setError('No se pudieron cargar las sesiones. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }
    
    try {
      await axios.delete(`https://backend-gemini-one.vercel.app/api/chat/sessions/${sessionId}`);
      setSessions(sessions.filter(session => session._id !== sessionId));
    } catch (error) {
      console.error('Error al eliminar la sesión:', error);
      alert('No se pudo eliminar la sesión. Intente nuevamente.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
          <h3 className="text-xl font-bold text-teal-700 flex items-center">
            <FaHistory className="mr-2" /> Historial de conversaciones
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <FaSpinner className="animate-spin text-teal-600 text-3xl mb-2" />
              <p className="text-gray-500">Cargando conversaciones...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-3">{error}</p>
              <button 
                onClick={loadSessions}
                className="bg-teal-100 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-200 transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No hay conversaciones guardadas</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {sessions.map(session => (
                <li 
                  key={session._id} 
                  onClick={() => onSelectSession(session._id, session.title)}
                  className="py-3 px-2 hover:bg-teal-50 cursor-pointer rounded transition-colors flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-teal-700 truncate">{session.title}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-1" size={12} /> 
                      {formatDate(session.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={(e) => handleDeleteSession(session._id, e)} 
                      className="text-red-500 hover:text-red-700 p-1 mr-2"
                      title="Eliminar conversación"
                    >
                      <FaTrash size={14} />
                    </button>
                    <FaArrowRight className="text-teal-500" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;
