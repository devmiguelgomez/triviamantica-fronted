import { useState, useRef } from 'react';
import axios from 'axios';
import { FaBook, FaSpinner, FaHistory, FaFlask, FaFutbol, FaGlobe, FaTheaterMasks, FaRandom, FaStar } from 'react-icons/fa';
import React from 'react';
import QuizQuestion from './QuizQuestion';

const StudyAssistant = () => {
  const [step, setStep] = useState('initial'); // initial, loading, quiz, results
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionType, setQuestionType] = useState('mixed');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');

  // Temas disponibles para la trivia
  const topics = [
    { id: 'historia', name: 'Historia', icon: <FaHistory /> },
    { id: 'cultura', name: 'Cultura', icon: <FaTheaterMasks /> },
    { id: 'deporte', name: 'Deporte', icon: <FaFutbol /> },
    { id: 'ciencia', name: 'Ciencia', icon: <FaFlask /> },
    { id: 'geografia', name: 'Geografía', icon: <FaGlobe /> },
  ];

  // Generar el cuestionario (conectar con el backend)
  const handleGenerateQuiz = async (topic) => {
    setSelectedTopic(topic);
    setError('');
    setIsLoading(true);
    setStep('loading');

    try {
      const formData = new FormData();
      formData.append('topic', topic);
      // Asegurarnos de usar un tipo válido para el backend
      formData.append('questionType', 'mixed');
      formData.append('questionCount', 5); // Fijo a 5 preguntas

      const response = await axios.post('http://localhost:5000/api/chat/quiz', formData, {
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
        error.response?.data?.details ||
        'Error al conectar con el servidor. Por favor verifica que el backend esté funcionando.'
      );
      setStep('initial');
    } finally {
      setIsLoading(false);
    }
  };

  // Generar una trivia aleatoria con preguntas de todos los temas
  const handleGenerateRandomQuiz = async () => {
    setSelectedTopic('aleatorio');
    setError('');
    setIsLoading(true);
    setStep('loading');

    try {
      const formData = new FormData();
      formData.append('topic', 'trivia aleatoria con una pregunta de cada tema: historia, cultura, deporte, ciencia y geografía');
      formData.append('questionType', 'mixed');
      formData.append('questionCount', 5); // Fijo a 5 preguntas

      const response = await axios.post('http://localhost:5000/api/chat/quiz', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSessionId(response.data.sessionId);
      setQuiz(response.data.quiz);
      setStep('quiz');
    } catch (error) {
      console.error('Error al generar la trivia aleatoria:', error);
      setError(
        error.response?.data?.error ||
        error.response?.data?.details ||
        'Error al conectar con el servidor. Por favor verifica que el backend esté funcionando.'
      );
      setStep('initial');
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
        questionType: currentQuestion.type || questionType // Usar el tipo específico de la pregunta
      };
      
      // Añadir información de respuesta correcta si está disponible
      if (currentQuestion.type === 'multiple-choice') {
        validationData.correctAnswer = currentQuestion.correctAnswer;
      } else if (currentQuestion.type === 'true-false') {
        validationData.correctAnswer = currentQuestion.isTrue ? 'true' : 'false';
      }
      
      // Validar respuesta con reintentos
      let retries = 0;
      const maxRetries = 3;
      let response;
      
      while (retries < maxRetries) {
        try {
          response = await axios.post('http://localhost:5000/api/chat/validate', validationData);
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
      const questionSpecificType = currentQuestion.type || questionType;
      let localEvaluation;
      
      if (questionSpecificType === 'multiple-choice') {
        const isCorrect = answer === currentQuestion.correctAnswer;
        localEvaluation = {
          isCorrect,
          feedback: isCorrect 
            ? "¡Correcto! 👏 (Validación local debido a un problema de conexión)" 
            : `Incorrecto. 😕 (Validación local debido a un problema de conexión)`
        };
      } else if (questionSpecificType === 'true-false') {
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
    setSelectedTopic('');
    setQuestionType('mixed');
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

  // Renderizar paso inicial con selección de temas
  const renderInitialStep = () => (
    <div className="flex flex-col items-center justify-center space-y-6 py-6">
      <div className="bg-[#262454] text-white rounded-full px-6 py-2 inline-flex items-center mb-4">
        <FaBook className="mr-2" /> 
        <span className="font-medium text-[#9e61ff]">Trivia de Conocimientos</span>
      </div>

      <div className="text-center mb-4">
        <p className="text-gray-600">
          Elige un tema para poner a prueba tus conocimientos con 5 preguntas interactivas.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg w-full max-w-md border border-red-200">
          {error}
        </div>
      )}

      {/* Opción especial para trivia aleatoria multitema */}
      <div className="w-full max-w-2xl mb-2">
        <button
          onClick={handleGenerateRandomQuiz}
          className="bg-[#262454] hover:bg-[#1e1a45] text-white border-2 border-[#9e61ff] rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3 w-full"
          data-cursor-pointer
        >
          <div className="bg-[#9e61ff] p-3 rounded-full text-white">
            <FaStar />
          </div>
          <div>
            <h3 className="font-medium text-lg text-[#9e61ff]">Trivia Mixta</h3>
            <p className="text-sm text-gray-300">Una pregunta de cada tema</p>
          </div>
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <h3 className="text-gray-700 font-medium mb-3">O elige un tema específico:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleGenerateQuiz(topic.id)}
              className="bg-white hover:bg-[#f0e8ff] border border-gray-200 hover:border-[#d3c0ff] rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
              data-cursor-pointer
            >
              <div className="bg-[#f0e8ff] p-3 rounded-full text-[#7e40f2]">
                {topic.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{topic.name}</h3>
                <p className="text-sm text-gray-500">5 preguntas de trivia</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Renderizar paso de carga
  const renderLoadingStep = () => (
    <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center min-h-[400px]">
      <div className="mb-6">
        <div className="w-16 h-16 border-t-4 border-b-4 border-[#9e61ff] rounded-full animate-spin"></div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        Preparando tu trivia 
        {selectedTopic === 'aleatorio' ? ' Mixta' : ` de ${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}`}
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        Estamos creando preguntas desafiantes para poner a prueba tus conocimientos.
        Este proceso puede tomar unos momentos...
      </p>
    </div>
  );

  // Renderizar paso de cuestionario
  const renderQuizStep = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-red-600 font-bold">Error al generar la trivia</h3>
          <p className="mt-2">No se pudieron generar preguntas. Por favor intenta con otro tema.</p>
          <button
            onClick={handleNewQuiz}
            className="mt-4 bg-[#9e61ff] text-white px-4 py-2 rounded-lg"
          >
            Volver a intentar
          </button>
        </div>
      );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const isAnswered = currentAnswer !== undefined;
    
    // Determinar el tipo específico de la pregunta actual
    const currentQuestionType = currentQuestion.type || questionType;

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#262454] p-4 text-white flex items-center justify-between">
          <h3 className="font-bold">
            Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}
          </h3>
          <span className="bg-white text-[#262454] px-3 py-1 rounded-full text-sm font-medium">
            {selectedTopic === 'aleatorio' ? 'Trivia Mixta' : `Trivia de ${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}`}
          </span>
        </div>

        <div className="p-6">
          <QuizQuestion
            question={currentQuestion}
            questionType={currentQuestionType}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
            userAnswer={currentAnswer?.userAnswer}
            isCorrect={currentAnswer?.isCorrect}
            feedback={currentAnswer?.feedback}
            isLoading={isLoading}
          />

          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {isAnswered ?
                `${currentQuestionIndex + 1 === quiz.questions.length ?
                  "Última pregunta" :
                  "Siguiente pregunta en breve..."}`
                : "Responde a la pregunta para continuar"}
            </div>
            <div className="flex items-center space-x-2">
              {[...Array(quiz.questions.length)].map((_, i) => {
                const answeredCorrectly = answers[i]?.isCorrect;
                const answeredIncorrectly = answers[i] !== undefined && !answers[i]?.isCorrect;
                
                return (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentQuestionIndex 
                        ? 'w-5 bg-[#9e61ff] ring-2 ring-[#d3c0ff]' 
                        : answeredCorrectly 
                          ? 'bg-green-500' 
                          : answeredIncorrectly 
                            ? 'bg-red-500' 
                            : 'bg-gray-300'
                    }`}
                  />
                );
              })}
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-center mb-6">
          {selectedTopic === 'aleatorio' 
            ? 'Resultados de la Trivia Mixta' 
            : `Resultados de la Trivia de ${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}`}
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
            const questionType = question.type || 'multiple-choice';
            
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
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">✓</div> : 
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">✗</div>
                    }
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
                      {question.explanation}
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md"
          >
            Probar Otro Tema
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
