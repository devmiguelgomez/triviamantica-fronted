import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const QuizQuestion = ({ 
  question, 
  questionType, 
  onAnswer, 
  isAnswered, 
  userAnswer, 
  isCorrect, 
  feedback,
  isLoading
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [openAnswer, setOpenAnswer] = useState('');
  
  // Resetear las selecciones cuando cambia la pregunta
  useEffect(() => {
    setSelectedAnswer('');
    setOpenAnswer('');
  }, [question]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (questionType === 'open-ended') {
      onAnswer(openAnswer);
    } else {
      onAnswer(selectedAnswer);
    }
  };
  
  // Renderizar pregunta de opción múltiple
  const renderMultipleChoice = () => {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium mb-4">{question.question}</h3>
        
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(97 + index); // a, b, c, d
            const isSelected = selectedAnswer === optionLetter;
            const isCorrectOption = isAnswered && question.correctAnswer === optionLetter;
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border flex items-center cursor-pointer transition-all ${
                  isAnswered
                    ? isCorrectOption
                      ? 'bg-green-50 border-green-300'
                      : isSelected
                        ? 'bg-red-50 border-red-300'
                        : 'border-gray-200'
                    : isSelected
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
                onClick={() => !isAnswered && setSelectedAnswer(optionLetter)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  isAnswered
                    ? isCorrectOption
                      ? 'bg-green-500 text-white'
                      : isSelected
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    : isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                }`}>
                  {optionLetter}
                </div>
                <span className="flex-grow">{option}</span>
                {isAnswered && (
                  isCorrectOption ? <FaCheck className="text-green-500" /> : 
                  isSelected ? <FaTimes className="text-red-500" /> : null
                )}
              </div>
            );
          })}
        </div>
        
        {!isAnswered && (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isLoading}
            className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
            Verificar Respuesta
          </button>
        )}
        
        {isAnswered && (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="font-medium mb-2 flex items-center">
              {isCorrect 
                ? <><FaCheck className="text-green-500 mr-2" /> ¡Correcto! 👏</>
                : <><FaTimes className="text-red-500 mr-2" /> Incorrecto 😕</>
              }
            </div>
            <p>{feedback || question.explanation}</p>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar pregunta de verdadero/falso
  const renderTrueFalse = () => {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium mb-4">{question.statement}</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {['true', 'false'].map((option) => {
            const isSelected = selectedAnswer === option;
            
            // Normalizar valores para comparación correcta
            const normalizedOption = option === 'true';
            const normalizedCorrectAnswer = question.isTrue === true || question.isTrue === 'true';
            const isCorrectOption = normalizedOption === normalizedCorrectAnswer;
            
            // Determinar si esta opción es correcta y si fue seleccionada
            const isCorrectAnswer = isAnswered && isCorrectOption;
            const isIncorrectSelection = isAnswered && isSelected && !isCorrectOption;
            
            return (
              <div 
                key={option}
                className={`p-3 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                  isAnswered
                    ? isCorrectAnswer
                      ? 'bg-green-50 border-green-300'
                      : isIncorrectSelection
                        ? 'bg-red-50 border-red-300'
                        : 'border-gray-200'
                    : isSelected
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
                onClick={() => !isAnswered && setSelectedAnswer(option)}
              >
                <span className="font-medium">{option === 'true' ? 'Verdadero' : 'Falso'}</span>
                {isAnswered && (
                  isCorrectAnswer ? <FaCheck className="text-green-500 ml-2" /> : 
                  isIncorrectSelection ? <FaTimes className="text-red-500 ml-2" /> : null
                )}
              </div>
            );
          })}
        </div>
        
        {!isAnswered && (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isLoading}
            className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
            Verificar Respuesta
          </button>
        )}
        
        {isAnswered && (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="font-medium mb-2 flex items-center">
              {isCorrect 
                ? <><FaCheck className="text-green-500 mr-2" /> ¡Correcto! 👏</>
                : <><FaTimes className="text-red-500 mr-2" /> Incorrecto 😕</>
              }
            </div>
            <p>{feedback || question.explanation}</p>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar pregunta abierta
  const renderOpenEnded = () => {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium mb-4">{question.question}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea 
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="5"
              placeholder="Escribe tu respuesta aquí..."
              disabled={isAnswered}
            />
          </div>
          
          {!isAnswered && (
            <button
              type="submit"
              disabled={!openAnswer.trim() || isLoading}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
              Enviar Respuesta
            </button>
          )}
        </form>
        
        {isAnswered && (
          <div className={`mt-4 p-4 rounded-lg ${
            isCorrect ? 'bg-green-50 border border-green-200' : 
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="font-medium mb-2">
              {isCorrect 
                ? "¡Bien hecho! 👏" 
                : "Puede mejorar 🤔"}
            </div>
            <p className="mb-3">{feedback}</p>
            
            <div className="mt-4 p-3 bg-white rounded border border-gray-200">
              <h4 className="font-medium text-sm text-gray-600 mb-1">Respuesta modelo:</h4>
              <p className="text-sm">{question.modelAnswer}</p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar según tipo de pregunta
  switch (questionType) {
    case 'multiple-choice':
      return renderMultipleChoice();
    case 'true-false':
      return renderTrueFalse();
    case 'open-ended':
      return renderOpenEnded();
    default:
      return <div>Tipo de pregunta no soportado</div>;
  }
};

export default QuizQuestion;
