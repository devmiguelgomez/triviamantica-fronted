import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 60000, // 60 segundos para permitir procesamiento de documentos
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptores para manejo global de errores
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || 'Error en la conexión con el servidor';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Servicios para el generador de cuestionarios
export const quizService = {
  // Generar un nuevo cuestionario
  generateQuiz: (formData) => {
    return api.post('/chat/quiz', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Validar respuesta del usuario
  validateAnswer: (data) => {
    return api.post('/chat/validate', data);
  },
  
  // Obtener sesiones anteriores
  getSessions: () => {
    return api.get('/chat/sessions');
  },
  
  // Obtener historial de conversación
  getConversationHistory: (sessionId) => {
    return api.get(`/chat/history?sessionId=${sessionId}`);
  }
};

export default api;
