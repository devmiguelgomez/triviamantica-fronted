import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { FaPaperPlane, FaBrain, FaUser, FaLightbulb, FaCalendarDay, FaHistory, FaPlus } from 'react-icons/fa'
import SessionHistory from './SessionHistory'

const ChatPrompt = () => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showSessionHistory, setShowSessionHistory] = useState(false)
  const conversationsEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (conversationsEndRef.current) {
      conversationsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversations])

  // Cargar historial de conversaciones si hay un sessionId
  const loadConversationHistory = async (id) => {
    if (!id) return;
    
    try {
      setIsLoadingHistory(true);
      const res = await axios.get(`https://backend-gemini-one.vercel.app/api/chat/history?sessionId=${id}`);
      
      if (res.data && res.data.length > 0) {
        const formattedConversations = res.data.flatMap(conv => [
          { role: 'user', content: conv.prompt },
          { role: 'assistant', content: conv.response }
        ]);
        setConversations(formattedConversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error al cargar el historial:', error);
      setConversations([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Agregar manejador de tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevenir el salto de línea por defecto
      handleSubmit(e); // Enviar el mensaje
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) return
    
    try {
      setIsLoading(true)
      
      // Agregar el prompt del usuario a las conversaciones
      const newConversations = [
        ...conversations, 
        { role: 'user', content: prompt }
      ]
      setConversations(newConversations)
      setPrompt('') // Limpiar el input inmediatamente para mejor UX
      
      // Incluir el sessionId si existe
      const res = await axios.post('https://backend-gemini-one.vercel.app/api/chat', { 
        prompt,
        sessionId 
      })
      
      // Si es la primera respuesta, guardar el sessionId y el título
      if (res.data.sessionId) {
        setSessionId(res.data.sessionId);
        
        if (res.data.sessionTitle) {
          setSessionTitle(res.data.sessionTitle);
        }
      }
      
      // Agregar la respuesta de la IA a las conversaciones
      setConversations([
        ...newConversations,
        { role: 'assistant', content: res.data.response }
      ])
    } catch (error) {
      console.error('Error al obtener respuesta:', error)
      setConversations([
        ...conversations,
        { role: 'user', content: prompt },
        { role: 'system', content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo. 😕' }
      ])
      setPrompt('')
    } finally {
      setIsLoading(false)
      // Enfocar el textarea después de enviar
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }
  
  // Función para iniciar una nueva conversación
  const handleNewConversation = () => {
    setConversations([]);
    setSessionId('');
    setSessionTitle('');
  };
  
  // Función para seleccionar una sesión del historial
  const handleSelectSession = (id, title) => {
    setSessionId(id);
    setSessionTitle(title);
    loadConversationHistory(id);
    setShowSessionHistory(false);
  };

  // Función para formatear el texto con saltos de línea
  const formatText = (text) => {
    // Divide el texto en párrafos y los une con saltos de línea en JSX
    return text.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
    ));
  };

  return (
    <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-teal-200 mx-auto max-w-2xl">
      {/* Header del chat */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <FaBrain className="mr-2 text-teal-200" /> Asistente de Organización
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSessionHistory(true)}
              className="bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded-md flex items-center transition-all"
              title="Ver historial de conversaciones"
            >
              <FaHistory className="mr-1" /> Historial
            </button>
            
            {sessionId && (
              <button 
                onClick={handleNewConversation}
                className="bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded-md flex items-center transition-all"
                title="Iniciar nueva conversación"
              >
                <FaPlus className="mr-1" /> Nueva
              </button>
            )}
          </div>
        </div>
        
        {sessionTitle && (
          <div className="mt-2 bg-white/10 px-3 py-1 rounded-md text-sm">
            <p className="truncate">
              {sessionTitle}
            </p>
          </div>
        )}
      </div>
      
      {/* Historial de conversaciones con mejor formateo - Altura fija */}
      <div className="h-[400px] overflow-y-auto p-4 bg-gradient-to-b from-teal-50 to-white relative">
        {isLoadingHistory ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
            <p className="mt-2 text-teal-600">Cargando conversación anterior...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <div className="p-6 bg-teal-100 rounded-full mb-4 shadow-inner">
              <FaCalendarDay className="text-5xl text-teal-600" />
            </div>
            <p className="text-xl font-semibold text-teal-800">¡Bienvenido a Daily Organizer! 👋</p>
            <p className="mt-2 text-teal-600">Cuéntame sobre tu día y te ayudaré a organizarlo mejor.</p>
            <div className="mt-4 bg-teal-50 p-4 rounded-lg border border-teal-100 text-sm">
              <p className="font-medium text-teal-700 mb-2">Ejemplos de lo que puedes preguntarme:</p>
              <ul className="list-disc pl-5 space-y-1 text-teal-600">
                <li>"Tengo clases en la mañana, trabajo en la tarde, y necesito estudiar. ¿Cómo organizo mi día?"</li>
                <li>"Quiero incluir 30 minutos de ejercicio diario en mi rutina"</li>
                <li>"Me siento abrumado con tantas tareas, ¿cómo priorizo?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {conversations.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl shadow-md ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-tr-none' 
                      : message.role === 'system'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-white text-gray-800 border border-teal-100 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center mb-1 font-medium">
                    {message.role === 'user' ? (
                      <>
                        <FaUser className="mr-1 text-white" /> <span className="text-white font-bold">Tú</span>
                      </>
                    ) : message.role === 'system' ? (
                      'Sistema'
                    ) : (
                      <>
                        <FaLightbulb className="mr-1 text-teal-600" /> <span className="text-teal-800">Gemini</span>
                      </>
                    )}
                  </div>
                  <div className={`whitespace-pre-wrap leading-relaxed text-sm md:text-base ${message.role === 'user' ? 'font-medium text-white' : ''}`}>
                    {formatText(message.content)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={conversationsEndRef} />
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start mt-4">
            <div className="max-w-[85%] p-3 bg-white border border-teal-100 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex items-center mb-1 font-medium">
                <FaLightbulb className="mr-1 text-teal-600" /> <span className="text-teal-800">Gemini</span>
              </div>
              <div className="flex space-x-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Formulario para enviar el prompt - Botón debajo del texto */}
      <form onSubmit={handleSubmit} className="p-4 bg-gradient-to-r from-teal-100 to-emerald-100 border-t border-teal-200">
        <div className="mb-2 relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sessionId ? "Continúa la conversación..." : "Describe tu día o pregunta cómo organizarlo mejor..."}
            className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-800 resize-none shadow-inner transition-all"
            rows="2"
            disabled={isLoading}
          />
          
          {sessionId && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full flex items-center">
                <FaHistory className="mr-1" /> Conversación en curso
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <FaPaperPlane className="mr-2" /> Enviar
          </button>
        </div>
        
        <p className="text-xs text-teal-500 mt-1 text-center">
          {isLoading ? '⏳ Analizando tu información...' : '💬 Presiona Enter para enviar'}
        </p>
      </form>
      
      {/* Diálogo para historial de sesiones */}
      {showSessionHistory && (
        <SessionHistory 
          onSelectSession={handleSelectSession} 
          onClose={() => setShowSessionHistory(false)} 
        />
      )}
    </div>
  )
}

export default ChatPrompt
