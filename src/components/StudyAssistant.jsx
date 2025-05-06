import { useState, useRef } from 'react';
import axios from 'axios';
import { FaBook, FaUpload, FaSpinner, FaListOl, FaQuestionCircle } from 'react-icons/fa';
import React from 'react';
import QuizQuestion from './QuizQuestion';

const StudyAssistant = () => {
  const [step, setStep] = useState('initial'); // initial, config, loading, quiz, results
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [questionCount, setQuestionCount] = useState(5);
  const [document, setDocument] = useState(null);
  const [documentPreview, setDocumentPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Manejar la selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocument(file);

      // Crear vista previa para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setDocumentPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview('');
      }
    }
  };

  // Iniciar la configuración del cuestionario
  const handleStart = () => {
    setStep('config');
  };

  // Generar el cuestionario (conectar con el backend)
  const handleGenerateQuiz = async () => {
    if (!topic && !document) {
      setError('Por favor ingresa un tema o sube un documento');
      return;
    }

    setError('');
    setIsLoading(true);
    setStep('loading');

    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('questionType', questionType);
      formData.append('questionCount', questionCount);

      if (document) {
        formData.append('document', document);
      }

      const response = await axios.post('https://backend-gemini-one.vercel.app/api/chat/quiz', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSessionId(response.data.sessionId);
      setQuiz(response.data.quiz);
      setStep('quiz');
    } catch (error) {
      console.error('Error al generar el cuestionario:', error);
      setError(
        error.response?.data?.error ||
        'Error al conectar con el servidor. Por favor verifica que el backend esté funcionando.'
      );
      setStep('config');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar respuestas del usuario
  const handleAnswer = async (answer) => {
    setIsLoading(true);
    
    try {
      // Obtener la pregunta actual
      const currentQuestion = quiz.questions[currentQuestionIndex];
      
      // Preparar la información para validar
      const validationData = {
        sessionId,
        questionIndex: currentQuestionIndex,
        userAnswer: answer,
        question: currentQuestion,
        questionType // Enviamos el tipo de pregunta para validación local
      };
      
      // Añadir información de respuesta correcta si está disponible
      if (questionType === 'multiple-choice') {
        validationData.correctAnswer = currentQuestion.correctAnswer;
      } else if (questionType === 'true-false') {
        validationData.correctAnswer = currentQuestion.isTrue ? 'true' : 'false';
      }
      
      // Validar respuesta con reintentos
      let retries = 0;
      const maxRetries = 3;
      let response;
      
      while (retries < maxRetries) {
        try {
          response = await axios.post('https://backend-gemini-one.vercel.app/api/chat/validate', validationData);
          break; // Si la llamada es exitosa, salir del bucle
        } catch (error) {
          retries++;
          console.log(`Intento ${retries}/${maxRetries} fallido`);
          
          if (retries >= maxRetries) {
            throw error; // Lanzar el error si se agotan los intentos
          }
          
          // Esperar antes de reintentar (backoff exponencial)
          const delay = 1000 * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // Comprobar si tenemos una respuesta fallback del servidor en caso de error
      if (response.data.fallbackResponse) {
        response.data = response.data.fallbackResponse;
      }
      
      // Guardar la respuesta y el feedback
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = {
        userAnswer: answer,
        ...response.data
      };
      setAnswers(newAnswers);
      
      // Pasar a la siguiente pregunta o mostrar resultados
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setIsLoading(false);
        }, 1500);
      } else {
        setTimeout(() => {
          setStep('results');
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error al validar la respuesta:', error);
      
      // Crear una respuesta local para continuar con el cuestionario
      const currentQuestion = quiz.questions[currentQuestionIndex];
      let localEvaluation;
      
      if (questionType === 'multiple-choice') {
        const isCorrect = answer === currentQuestion.correctAnswer;
        localEvaluation = {
          isCorrect,
          feedback: isCorrect 
            ? "¡Correcto! 👏 (Validación local debido a un problema de conexión)" 
            : `Incorrecto. 😕 (Validación local debido a un problema de conexión)`
        };
      } else if (questionType === 'true-false') {
        const normalizedUserAnswer = answer.toLowerCase() === 'true';
        const normalizedCorrectAnswer = currentQuestion.isTrue === true || currentQuestion.isTrue === 'true';
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        localEvaluation = {
          isCorrect,
          feedback: isCorrect 
            ? "¡Correcto! 👏 (Validación local debido a un problema de conexión)" 
            : `Incorrecto. 😕 La respuesta correcta es ${normalizedCorrectAnswer ? 'Verdadero' : 'Falso'}. (Validación local debido a un problema de conexión)`
        };
      } else {
        localEvaluation = {
          isCorrect: null,
          score: null,
          feedback: "No se pudo conectar con el sistema de evaluación. Por favor, compara tu respuesta con la respuesta modelo. 🔍"
        };
      }
      
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = {
        userAnswer: answer,
        ...localEvaluation
      };
      setAnswers(newAnswers);
      setError('Hubo un problema al validar tu respuesta. Se ha utilizado validación local.');
      
      // Continuar con la siguiente pregunta o mostrar resultados
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setIsLoading(false);
        }, 1500);
      } else {
        setTimeout(() => {
          setStep('results');
          setIsLoading(false);
        }, 1500);
      }
    }
  };

  // Reiniciar todo para un nuevo cuestionario
  const handleNewQuiz = () => {
    setTopic('');
    setQuestionType('multiple-choice');
    setQuestionCount(5);
    setDocument(null);
    setDocumentPreview('');
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSessionId('');
    setError('');
    setStep('initial');
  };

  // Calcular puntaje final
  const calculateScore = () => {
    if (!answers.length) return 0;

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  };

  // Renderizar paso inicial
  const renderInitialStep = () => (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          <FaBook className="inline-block mr-2" /> Asistente de Estudio
        </h2>
        <p className="text-indigo-600 max-w-md">
          Crea cuestionarios personalizados para estudiar cualquier tema.
          Sube un documento o simplemente escribe el tema que deseas estudiar.
        </p>
      </div>

      <button
        onClick={handleStart}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center"
        aria-label="Empezar a estudiar"
        data-cursor-pointer
      >
        <FaQuestionCircle className="mr-2" /> Empezar a Estudiar
      </button>
    </div>
  );

  // Renderizar paso de configuración
  const renderConfigStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-indigo-700 mb-6 flex items-center">
        <FaBook className="mr-2" /> Configurar Cuestionario
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-indigo-700 font-medium mb-2">
            Tema de estudio
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: Historia de América, Matemáticas, Filosofía..."
            className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-indigo-700 font-medium mb-2">
            Documento (opcional)
          </label>
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full p-3 border border-dashed border-indigo-400 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
              data-cursor-pointer
            >
              <FaUpload className="mr-2" />
              {document ? document.name : "Seleccionar archivo (PDF o Word)"}
            </button>
          </div>

          {documentPreview && (
            <div className="mt-2">
              <img
                src={documentPreview}
                alt="Vista previa"
                className="max-h-32 rounded-lg border border-indigo-200"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-indigo-700 font-medium mb-2">
            Tipo de preguntas
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="multiple-choice">Opción múltiple (a, b, c, d)</option>
            <option value="true-false">Verdadero o Falso</option>
            <option value="open-ended">Preguntas abiertas</option>
          </select>
        </div>

        <div>
          <label className="block text-indigo-700 font-medium mb-2">
            Número de preguntas
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[3, 5, 7, 10].map(num => (
              <option key={num} value={num}>{num} preguntas</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex space-x-3">
        <button
          onClick={() => setStep('initial')}
          className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          data-cursor-pointer
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerateQuiz}
          className="flex-grow bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
          data-cursor-pointer
        >
          <FaListOl className="mr-2" /> Generar Cuestionario
        </button>
      </div>
    </div>
  );

  // Renderizar paso de carga
  const renderLoadingStep = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="mb-6">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
      </div>
      <h3 className="text-xl font-bold text-indigo-700 mb-2">Generando tu cuestionario</h3>
      <p className="text-indigo-600 text-center max-w-md">
        Estoy analizando el tema y creando preguntas personalizadas para ti.
        Este proceso puede tomar unos momentos...
      </p>
    </div>
  );

  // Renderizar paso de cuestionario
  const renderQuizStep = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-red-600 font-bold">Error al generar el cuestionario</h3>
          <p className="mt-2">No se pudieron generar preguntas. Por favor intenta con otro tema.</p>
          <button
            onClick={handleNewQuiz}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Volver a intentar
          </button>
        </div>
      );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const isAnswered = currentAnswer !== undefined;

    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-xl text-white flex items-center justify-between">
          <h3 className="font-bold">
            Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}
          </h3>
          <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {questionType === 'multiple-choice' ? 'Opción Múltiple' :
             questionType === 'true-false' ? 'Verdadero/Falso' : 'Pregunta Abierta'}
          </span>
        </div>

        <div className="p-6">
          <QuizQuestion
            question={currentQuestion}
            questionType={questionType}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
            userAnswer={currentAnswer?.userAnswer}
            isCorrect={currentAnswer?.isCorrect}
            feedback={currentAnswer?.feedback}
            isLoading={isLoading}
          />

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-indigo-600">
              {isAnswered ?
                `${currentQuestionIndex + 1 === quiz.questions.length ?
                  "Última pregunta" :
                  "Siguiente pregunta en breve..."}`
                : "Responde a la pregunta para continuar"}
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(quiz.questions.length)].map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentQuestionIndex ?
                      'bg-indigo-600' :
                      answers[i] ?
                        (answers[i].isCorrect ? 'bg-green-500' : 'bg-red-500') :
                        'bg-indigo-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar resultados
  const renderResultsStep = () => {
    const score = calculateScore();

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-center mb-6">
          Resultados del Cuestionario
        </h2>

        <div className="flex justify-center mb-8">
          <div className={`rounded-full p-4 ${
            score >= 70 ? 'bg-green-100 text-green-600' :
            score >= 40 ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            <span className="text-4xl font-bold">{score}%</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {quiz.questions.map((question, index) => {
            const answer = answers[index];
            
            let correctAnswerText = '';
            if (!answer?.isCorrect && questionType === 'multiple-choice') {
              correctAnswerText = `${question.correctAnswer}) ${question.options[question.correctAnswer.charCodeAt(0) - 97]}`;
            } else if (!answer?.isCorrect && questionType === 'true-false') {
              correctAnswerText = question.isTrue ? 'Verdadero' : 'Falso';
            }
            
            return (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  answer?.isCorrect ? 
                    'border-green-200 bg-green-50' : 
                    'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {answer?.isCorrect ? 
                      <span className="text-green-500">✓</span> : 
                      <span className="text-red-500">✗</span>}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {questionType === 'true-false' ? question.statement : question.question}
                    </h4>
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Tu respuesta:</span> {
                        answer?.userAnswer === 'true' ? 'Verdadero' : 
                        answer?.userAnswer === 'false' ? 'Falso' : 
                        answer?.userAnswer
                      }
                    </div>
                    
                    {!answer?.isCorrect && (
                      <div className="mt-1 text-sm text-green-700">
                        <span className="font-medium">Respuesta correcta:</span> {correctAnswerText}
                      </div>
                    )}
                    
                    <div className="mt-2 text-sm border-t border-gray-200 pt-2">
                      {questionType === 'open-ended' ? answer?.feedback : question.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleNewQuiz}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Crear Nuevo Cuestionario
          </button>
        </div>
      </div>
    );
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch(step) {
      case 'initial':
        return renderInitialStep();
      case 'config':
        return renderConfigStep();
      case 'loading':
        return renderLoadingStep();
      case 'quiz':
        return renderQuizStep();
      case 'results':
        return renderResultsStep();
      default:
        return renderInitialStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto prevent-cursor-issues">
      {renderCurrentStep()}
    </div>
  );
};

export default StudyAssistant;
