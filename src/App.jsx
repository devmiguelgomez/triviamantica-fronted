import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col, Button, Card, Badge, Spinner, Alert } from 'react-bootstrap'
import './App.css'
import TemaButton from './components/TemaButton'
import Preguntas from './components/Preguntas'
import axios from 'axios'
import confetti from 'canvas-confetti'

// Configurar axios para manejar errores de red y timeout
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('La solicitud tomó demasiado tiempo en completarse:', error);
    } else {
      console.error('Error en petición:', error);
    }
    return Promise.reject(error);
  }
);

// Configurar timeout global para axios
axios.defaults.timeout = 30000; // 30 segundos

function App() {
  const [temaSeleccionado, setTemaSeleccionado] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [mostrarPreguntas, setMostrarPreguntas] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [animateOut, setAnimateOut] = useState(false)
  const [backendStatus, setBackendStatus] = useState('desconocido')

  const temas = [
    { 
      nombre: 'Cultura', 
      color: 'primary',
      icon: '🎭',
      descripcion: 'Pon a prueba tus conocimientos sobre arte, literatura y música'
    },
    { 
      nombre: 'Videojuegos', 
      color: 'success',
      icon: '🎮',
      descripcion: 'Desafía tu conocimiento sobre el mundo de los videojuegos'
    },
    { 
      nombre: 'Historia', 
      color: 'danger',
      icon: '📜',
      descripcion: 'Viaja al pasado con estas preguntas históricas'
    },
    { 
      nombre: 'Deporte', 
      color: 'warning',
      icon: '⚽',
      descripcion: 'Demuestra tu pasión por los deportes con estas preguntas'
    },
    { 
      nombre: 'Geografía', 
      color: 'info',
      icon: '🌍',
      descripcion: 'Recorre el mundo con estas preguntas de geografía'
    },
    { 
      nombre: 'Trivia Mixta', 
      color: 'secondary',
      icon: '🎲',
      descripcion: 'Una mezcla de preguntas para los más valientes'
    }
  ]

  const handleTemaSelect = async (tema) => {
    setLoading(true);
    setError(null);
    
    try {
      // Agregamos un timeout local para evitar esperas excesivas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('La solicitud tomó demasiado tiempo')), 25000);
      });
      
      console.log("Solicitando preguntas para tema:", tema.nombre);
      
      // Usando Promise.race para implementar un timeout
      const preguntasData = await Promise.race([
        new Promise((resolve) => {
          TemaButton.fetchPreguntas(
            tema,
            setTemaSeleccionado,
            setPreguntas,
            setMostrarPreguntas,
            (tema, preguntas) => {
              console.log("Callback recibido con preguntas:", preguntas);
              setTemaSeleccionado(tema.nombre);
              setPreguntas(preguntas);
              setMostrarPreguntas(true);
              resolve(preguntas);
            },
            true
          );
        }),
        timeoutPromise
      ]);
      
      console.log("Preguntas cargadas exitosamente:", preguntasData);
      console.log("Estado actual:", {
        temaSeleccionado,
        preguntasLength: preguntas.length,
        mostrarPreguntas
      });
      
      // Verificar explícitamente si las preguntas están en el estado
      setTimeout(() => {
        if (preguntas.length === 0 && mostrarPreguntas) {
          console.warn("Estado inconsistente: mostrarPreguntas es true pero no hay preguntas");
          const fallbackQuestions = generateFallbackQuestions(tema.nombre);
          console.log("Usando preguntas de respaldo:", fallbackQuestions);
          setPreguntas(fallbackQuestions);
        }
      }, 1000);
      
      // Lanzar confeti al seleccionar una categoría solo si hay preguntas
      if (preguntasData && preguntasData.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Error en la carga de preguntas:", err);
      setError(`No se pudieron cargar las preguntas: ${err.message}`);
      
      // Si hay un error, generar preguntas de respaldo
      const fallbackQuestions = generateFallbackQuestions(tema.nombre);
      setTemaSeleccionado(tema.nombre);
      setPreguntas(fallbackQuestions);
      setMostrarPreguntas(true);
    } finally {
      setLoading(false);
    }
  };

  const volverAInicio = () => {
    setAnimateOut(true);
    
    setTimeout(() => {
      setTemaSeleccionado(null);
      setPreguntas([]);
      setMostrarPreguntas(false);
      setError(null);
      setAnimateOut(false);
    }, 150);
  }

  // Verificar la conexión al backend al iniciar
  useEffect(() => {
    const verificarBackend = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/test', { timeout: 3000 });
        console.log('Conexión al backend establecida:', response.data);
        setBackendStatus('conectado');
      } catch (err) {
        console.warn('No se pudo conectar al backend:', err.message);
        setBackendStatus('desconectado');
      }
    };
    
    verificarBackend();
  }, []);

  // Generar preguntas de respaldo si es necesario
  const generateFallbackQuestions = (tema) => {
    const fallbackQuestions = [
      { 
        pregunta: "¿Esta pregunta se generó localmente porque hubo un problema con el backend?", 
        opciones: ["Verdadero", "Falso"], 
        respuestaCorrecta: "Verdadero" 
      },
      { 
        pregunta: `¿Qué tema seleccionaste?`, 
        opciones: [tema, "Otro tema", "Ninguno"], 
        respuestaCorrecta: tema 
      }
    ];
    
    return fallbackQuestions;
  };

  useEffect(() => {
    document.title = temaSeleccionado ? `Trivia - ${temaSeleccionado}` : 'Trivia Mántica';
  }, [temaSeleccionado]);

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">¡Trivia Mántica!</h1>
      
      {backendStatus === 'desconectado' && (
        <Alert variant="warning" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          No se pudo conectar al servidor. Las preguntas se generarán localmente.
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3 lead">Preparando tus preguntas...</p>
          <p className="text-muted">Esto puede tardar unos segundos...</p>
        </div>
      ) : !mostrarPreguntas ? (
        <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
          {temas.map((tema) => (
            <Col key={tema.nombre}>
              <Card className="tema-card h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="tema-icon mb-3 display-1">{tema.icon}</div>
                  <Card.Title className="mb-3">{tema.nombre}</Card.Title>
                  <Badge bg={tema.color} className="mb-3 py-2 px-3">{tema.nombre}</Badge>
                  <Card.Text className="mb-3">{tema.descripcion}</Card.Text>
                  <Button 
                    variant={tema.color} 
                    className="mt-auto btn-block tema-btn"
                    onClick={() => handleTemaSelect(tema)}
                  >
                    Jugar <i className="fas fa-play ms-2"></i>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className={`fade-transition ${animateOut ? 'fade-out' : 'fade-in'}`}>
          {preguntas && preguntas.length > 0 ? (
            <Preguntas
              preguntas={preguntas}
              tema={temaSeleccionado}
              volverAInicio={volverAInicio}
            />
          ) : (
            <Alert variant="danger" className="text-center">
              <h4>Error al cargar las preguntas</h4>
              <p>No se pudieron obtener preguntas para este tema.</p>
              <Button variant="primary" onClick={volverAInicio} className="mt-3">
                Volver al inicio
              </Button>
            </Alert>
          )}
        </div>
      )}
      
      <footer className="text-center mt-5 pt-4">
        <p className="text-muted">
          <small>2025 Trivia Mántica | Conectado a Gemini AI  | Desarrollado por Miguel Gomez</small>
        </p>
      </footer>
    </Container>
  )
}

export default App
