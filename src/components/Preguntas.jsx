import { useState, useEffect } from 'react';
import { Button, Alert, ProgressBar } from 'react-bootstrap';

const Preguntas = ({ preguntas, tema, volverAInicio }) => {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState(null);
  const [correctas, setCorrectas] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reiniciar el estado cuando cambian las preguntas
  useEffect(() => {
    setPreguntaActual(0);
    setSeleccionada(null);
    setCorrectas(0);
    setJuegoTerminado(false);
    setMostrarResultado(false);
    setIsLoading(false);
    
    console.log("Preguntas recibidas en componente:", preguntas);
    
    // Verificar formato de preguntas
    if (preguntas && preguntas.length > 0) {
      preguntas.forEach((pregunta, index) => {
        console.log(`Pregunta ${index + 1}:`, pregunta);
        if (!pregunta.pregunta) console.warn(`Pregunta ${index + 1} sin texto de pregunta`);
        if (!pregunta.opciones || !Array.isArray(pregunta.opciones)) 
          console.warn(`Pregunta ${index + 1} sin opciones válidas`);
        if (!pregunta.respuestaCorrecta) 
          console.warn(`Pregunta ${index + 1} sin respuesta correcta definida`);
      });
    }
  }, [preguntas]);

  // Verificar si las preguntas son válidas
  useEffect(() => {
    if (preguntas && preguntas.length > 0) {
      const preguntaActualData = preguntas[preguntaActual];
      console.log("Mostrando pregunta:", preguntaActualData);
    }
  }, [preguntaActual, preguntas]);

  const verificarRespuesta = (opcion) => {
    setSeleccionada(opcion);
    setMostrarResultado(true);
    
    const preguntaActualData = preguntas[preguntaActual];
    if (preguntaActualData && opcion === preguntaActualData.respuestaCorrecta) {
      setCorrectas(prev => prev + 1);
    }
  };

  const siguientePregunta = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(prev => prev + 1);
        setSeleccionada(null);
        setMostrarResultado(false);
      } else {
        setJuegoTerminado(true);
      }
      setIsLoading(false);
    }, 300);
  };

  // Si no hay preguntas, mostrar mensaje de error
  if (!preguntas || preguntas.length === 0) {
    return (
      <Alert variant="warning" className="text-center">
        <h4>¡No hay preguntas disponibles!</h4>
        <p>No se pudieron encontrar preguntas para este tema.</p>
        <Button variant="primary" onClick={volverAInicio} className="mt-3">
          <i className="fas fa-arrow-left me-2"></i>
          Volver al inicio
        </Button>
      </Alert>
    );
  }

  // Asegurar que la pregunta actual exista
  const preguntaActualData = preguntas[preguntaActual];
  if (!preguntaActualData || !preguntaActualData.pregunta || !preguntaActualData.opciones) {
    return (
      <Alert variant="danger" className="text-center">
        <h4>Error al cargar la pregunta</h4>
        <p>La pregunta actual no está disponible o tiene un formato incorrecto.</p>
        <p><small>Datos recibidos: {JSON.stringify(preguntaActualData)}</small></p>
        <Button variant="primary" onClick={volverAInicio} className="mt-3">
          <i className="fas fa-home me-2"></i>
          Volver al inicio
        </Button>
      </Alert>
    );
  }

  return (
    <div className="preguntas-container">
      {!juegoTerminado ? (
        <>
          <div className="mb-4">
            <h2 className="mb-3">
              <span className="badge bg-primary me-2">
                <i className="fas fa-lightbulb me-1"></i> {tema}
              </span>
              {preguntaActualData.temaPregunta && (
                <span className="badge bg-secondary me-2">
                  <i className="fas fa-tag me-1"></i> {preguntaActualData.temaPregunta}
                </span>
              )}
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
              <span className="badge bg-success">Correctas: {correctas}</span>
            </div>
            <ProgressBar 
              now={((preguntaActual + 1) / preguntas.length) * 100} 
              variant="success"
              style={{ height: '10px', borderRadius: '5px' }}
              className="mb-4"
            />
          </div>

          <div className="pregunta-card">
            <h3 className="mb-4">{preguntaActualData.pregunta}</h3>
            
            <div className={`opciones-grid ${preguntaActualData.opciones.length <= 2 ? 'opciones-grid-small' : ''}`}>
              {preguntaActualData.opciones.map((opcion, index) => (
                <Button
                  key={index}
                  variant={
                    mostrarResultado
                      ? opcion === preguntaActualData.respuestaCorrecta
                        ? 'success'
                        : opcion === seleccionada && opcion !== preguntaActualData.respuestaCorrecta
                        ? 'danger'
                        : preguntaActualData.opciones.length <= 2 ? 'outline-primary' : 'light'
                      : preguntaActualData.opciones.length <= 2 ? 'outline-primary' : 'light'
                  }
                  className={`text-start opcion-btn ${
                    mostrarResultado && opcion === preguntaActualData.respuestaCorrecta
                      ? 'correcta'
                      : mostrarResultado && opcion === seleccionada && opcion !== preguntaActualData.respuestaCorrecta
                      ? 'incorrecta'
                      : ''
                  } ${preguntaActualData.opciones.length <= 2 ? 'verdadero-falso-btn' : ''}`}
                  onClick={() => !mostrarResultado && verificarRespuesta(opcion)}
                  disabled={mostrarResultado || isLoading}
                >
                  {preguntaActualData.opciones.length <= 2 ? (
                    <span className="d-block text-center fs-5">{opcion}</span>
                  ) : (
                    <>{index === 0 ? 'A: ' : index === 1 ? 'B: ' : index === 2 ? 'C: ' : 'D: '} {opcion}</>
                  )}
                </Button>
              ))}
            </div>
            
            {mostrarResultado && (
              <div className="mt-4 text-center">
                <Alert variant={seleccionada === preguntaActualData.respuestaCorrecta ? "success" : "danger"}>
                  {seleccionada === preguntaActualData.respuestaCorrecta 
                    ? <><i className="fas fa-check-circle me-2"></i>¡Respuesta correcta!</> 
                    : <><i className="fas fa-times-circle me-2"></i>Respuesta incorrecta. La respuesta correcta es: {preguntaActualData.respuestaCorrecta}</>}
                </Alert>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={siguientePregunta} 
                  className="mt-3"
                  disabled={isLoading}
                >
                  {preguntaActual < preguntas.length - 1 ? "Siguiente pregunta" : "Ver resultados"}
                  <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center result-message">
          <h2 className="mb-4">
            <i className="fas fa-trophy me-2 text-warning"></i>
            ¡Juego terminado!
          </h2>
          <div className="score-display">{correctas} / {preguntas.length}</div>
          <Alert 
            variant={
              correctas === preguntas.length 
                ? "success" 
                : correctas >= preguntas.length / 2 
                ? "info" 
                : "warning"
            }
          >
            {correctas === preguntas.length 
              ? <><i className="fas fa-star me-1"></i> ¡Perfecto! ¡Has acertado todas las preguntas!</> 
              : correctas >= preguntas.length / 2 
              ? <><i className="fas fa-thumbs-up me-1"></i> ¡Buen trabajo! Has acertado {correctas} de {preguntas.length} preguntas.</> 
              : <><i className="fas fa-book me-1"></i> Has acertado {correctas} de {preguntas.length} preguntas. ¡Sigue practicando!</>}
          </Alert>
          <Button variant="primary" size="lg" onClick={volverAInicio} className="mt-3">
            <i className="fas fa-home me-2"></i>
            Volver al inicio
          </Button>
        </div>
      )}
    </div>
  );
};

export default Preguntas;