import { Button } from 'react-bootstrap';
import axios from 'axios';

// Usa la variable de entorno si está disponible, o la URL de producción por defecto
const API_URL = import.meta.env.VITE_API_URL || 'https://triviabackend.vercel.app/api';

const TemaButton = ({ tema, setTemaSeleccionado, setPreguntas, setMostrarPreguntas }) => {
  const handleClick = () => {
    TemaButton.fetchPreguntas(tema, setTemaSeleccionado, setPreguntas, setMostrarPreguntas);
  };

  return (
    <Button
      variant={tema.color}
      className="w-100 py-4 d-flex align-items-center justify-content-center tema-btn"
      onClick={handleClick}
    >
      {tema.icon && <span className="me-2">{tema.icon}</span>}
      {tema.nombre}
    </Button>
  );
};

// Método estático para obtener preguntas
TemaButton.fetchPreguntas = async (tema, setTemaSeleccionado, setPreguntas, setMostrarPreguntas, callback, fast = false) => {
  try {
    // Usar memorización para evitar cargas repetidas
    if (TemaButton.cache && TemaButton.cache[tema.nombre]) {
      const cachedData = TemaButton.cache[tema.nombre];
      
      if (callback) {
        callback(tema, cachedData);
      } else {
        setTemaSeleccionado(tema.nombre);
        setPreguntas(cachedData);
        setMostrarPreguntas(true);
      }
      return;
    }
    
    console.log(`Solicitando preguntas para tema: ${tema.nombre}`);
    
    let preguntasFinal = [];
    
    // Manejo especial para Trivia Mixta
    if (tema.nombre === 'Trivia Mixta') {
      console.log("Creando preguntas para Trivia Mixta");
      const temasMixtos = ['Cultura', 'Videojuegos', 'Historia', 'Deporte', 'Geografía'];
      
      // Para cada tema obtener una pregunta
      for (const nombreTema of temasMixtos) {
        try {
          console.log(`Obteniendo pregunta de ${nombreTema} para trivia mixta`);
          
          // Verificar si ya tenemos preguntas en caché para este tema
          if (TemaButton.cache && TemaButton.cache[nombreTema]) {
            // Obtenemos una pregunta aleatoria de las cacheadas
            const preguntasDeTema = TemaButton.cache[nombreTema];
            const preguntaAleatoria = preguntasDeTema[Math.floor(Math.random() * preguntasDeTema.length)];
            preguntasFinal.push({
              ...preguntaAleatoria,
              temaPregunta: nombreTema // Añadimos el tema al que pertenece
            });
            continue;
          }
          
          // Si no tenemos el tema en caché, hacemos una petición para este tema
          const response = await axios.post(`${API_URL}/trivias`, {
            tema: nombreTema,
            cantidad: 1
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000 // Reducimos el timeout para no esperar mucho por tema
          });
          
          // Extraer la pregunta y añadirla a nuestras preguntas finales
          if (response.data && response.data.preguntas && response.data.preguntas.length > 0) {
            const pregunta = response.data.preguntas[0];
            preguntasFinal.push({
              ...pregunta,
              temaPregunta: nombreTema
            });
          }
        } catch (error) {
          console.error(`Error al obtener pregunta de ${nombreTema}:`, error);
          // Añadimos una pregunta fallback de este tema
          preguntasFinal.push(
            generateDemoQuestions(nombreTema)[0]
          );
        }
      }
      
      // Añadir una pregunta verdadero/falso
      preguntasFinal.push({
        pregunta: "¿Una trivia mixta contiene preguntas de diferentes categorías?",
        opciones: ["Verdadero", "Falso"],
        respuestaCorrecta: "Verdadero",
        temaPregunta: "General"
      });
      
      // Mezclar las preguntas para que no siempre estén en el mismo orden
      preguntasFinal = shuffleArray(preguntasFinal);
      
      // Guardar en caché
      if (!TemaButton.cache) TemaButton.cache = {};
      TemaButton.cache[tema.nombre] = preguntasFinal;
      
      if (callback) {
        callback(tema, preguntasFinal);
      } else {
        setTemaSeleccionado(tema.nombre);
        setPreguntas(preguntasFinal);
        setMostrarPreguntas(true);
      }
      
      return preguntasFinal;
    } 
    else {
      // Para temas normales, el flujo original
      const response = await axios.post(`${API_URL}/trivias`, {
        tema: tema.nombre,
        cantidad: 5  // Número de preguntas a generar
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // Aumentamos el timeout a 30 segundos
      });
      
      console.log("Respuesta del backend:", response);
      
      // Más detalles para depuración
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      
      // Verificar si la respuesta contiene preguntas (con lógica mejorada)
      const preguntasData = response.data && response.data.preguntas ? response.data.preguntas : [];
      
      if (Array.isArray(preguntasData) && preguntasData.length > 0) {
        console.log(`Recibidas ${preguntasData.length} preguntas para el tema ${tema.nombre}`);
        
        // Validar el formato de cada pregunta
        const preguntasValidas = preguntasData.filter(pregunta => {
          const esValida = pregunta && 
                         pregunta.pregunta && 
                         Array.isArray(pregunta.opciones) && 
                         pregunta.opciones.length >= 2 &&
                         pregunta.respuestaCorrecta;
          
          if (!esValida) {
            console.warn("Pregunta con formato inválido:", pregunta);
          }
          
          return esValida;
        });
        
        // Añadir una pregunta de verdadero/falso
        const verdaderoFalsoQuestion = generateTrueFalseQuestion(tema.nombre);
        preguntasValidas.push(verdaderoFalsoQuestion);
        
        // Guardar en caché para futuras consultas
        if (!TemaButton.cache) TemaButton.cache = {};
        TemaButton.cache[tema.nombre] = preguntasValidas;
        
        // Llamar al callback o actualizar estados directamente
        if (callback) {
          callback(tema, preguntasValidas);
        } else {
          setTemaSeleccionado(tema.nombre);
          setPreguntas(preguntasValidas);
          setMostrarPreguntas(true);
        }
        
        return preguntasValidas;
      } else {
        console.warn("La respuesta no contiene preguntas válidas:", response.data);
        throw new Error("El servidor no devolvió preguntas válidas");
      }
    }
  } catch (error) {
    console.error('Error al obtener preguntas del backend:', error);
    console.error('Detalles del error:', error.response || error.message);
    
    // Generar algunas preguntas de ejemplo como fallback
    let demoQuestions;
    
    if (tema.nombre === 'Trivia Mixta') {
      // Para trivia mixta, obtenemos una pregunta de cada tema
      demoQuestions = [];
      ['Cultura', 'Videojuegos', 'Historia', 'Deporte', 'Geografía'].forEach(nombreTema => {
        const preguntasTema = generateDemoQuestions(nombreTema);
        demoQuestions.push({
          ...preguntasTema[0],
          temaPregunta: nombreTema
        });
      });
      
      // Añadir una pregunta de verdadero/falso
      demoQuestions.push({
        pregunta: "¿Una trivia mixta contiene preguntas de diferentes categorías?",
        opciones: ["Verdadero", "Falso"],
        respuestaCorrecta: "Verdadero",
        temaPregunta: "General"
      });
      
      // Mezclar las preguntas
      demoQuestions = shuffleArray(demoQuestions);
    } else {
      demoQuestions = generateDemoQuestions(tema.nombre);
      
      // Añadir una pregunta de verdadero/falso
      demoQuestions.push(generateTrueFalseQuestion(tema.nombre));
    }
    
    console.log(`Usando ${demoQuestions.length} preguntas de demostración para ${tema.nombre}`);
    
    // Guardar en caché las preguntas de demostración
    if (!TemaButton.cache) TemaButton.cache = {};
    TemaButton.cache[tema.nombre] = demoQuestions;
    
    if (callback) {
      callback(tema, demoQuestions);
    } else {
      setTemaSeleccionado(tema.nombre);
      setPreguntas(demoQuestions);
      setMostrarPreguntas(true);
    }
    
    return demoQuestions;
  }
};

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Función para generar preguntas de verdadero/falso según el tema
function generateTrueFalseQuestion(tema) {
  const trueFalseQuestionsByTema = {
    'Cultura': [
      { pregunta: "¿Vincent van Gogh se cortó toda la oreja?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Falso" },
      { pregunta: "¿Pablo Picasso es considerado el padre del cubismo?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" }
    ],
    'Videojuegos': [
      { pregunta: "¿Super Mario Bros. fue creado por Shigeru Miyamoto?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" },
      { pregunta: "¿El protagonista de The Legend of Zelda se llama Zelda?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Falso" }
    ],
    'Historia': [
      { pregunta: "¿La Revolución Francesa terminó con la ejecución de Luis XVI?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Falso" },
      { pregunta: "¿La Gran Muralla China es visible desde el espacio a simple vista?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Falso" }
    ],
    'Deporte': [
      { pregunta: "¿El tenista Rafael Nadal ha ganado más de 10 veces Roland Garros?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" },
      { pregunta: "¿La FIFA se fundó en el año 1950?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Falso" }
    ],
    'Geografía': [
      { pregunta: "¿Australia es el continente más pequeño del mundo?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" },
      { pregunta: "¿El río Nilo es más largo que el río Amazonas?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Falso" }
    ],
    'Trivia Mixta': [
      { pregunta: "¿Una trivia mixta contiene preguntas de diferentes categorías?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" },
      { pregunta: "¿Todos los mamíferos tienen 7 vértebras cervicales?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" }
    ]
  };
  
  const questions = trueFalseQuestionsByTema[tema] || [
    { pregunta: "¿La principal función de las mitocondrias es generar energía para la célula?", opciones: ["Verdadero", "Falso"], respuestaCorrecta: "Verdadero" }
  ];
  
  // Elegir una pregunta aleatoria
  return questions[Math.floor(Math.random() * questions.length)];
}

// Función para generar preguntas de ejemplo en caso de error
function generateDemoQuestions(tema) {
  const questionsByTema = {
    'Cultura': [
      { pregunta: "¿Quién pintó La Mona Lisa?", opciones: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Miguel Ángel"], respuestaCorrecta: "Leonardo da Vinci" },
      { pregunta: "¿Qué famoso escritor escribió 'Cien años de soledad'?", opciones: ["Gabriel García Márquez", "Julio Cortázar", "Mario Vargas Llosa", "Pablo Neruda"], respuestaCorrecta: "Gabriel García Márquez" }
    ],
    'Videojuegos': [
      { pregunta: "¿Qué compañía desarrolló el juego Minecraft?", opciones: ["Mojang", "EA", "Ubisoft", "Activision"], respuestaCorrecta: "Mojang" },
      { pregunta: "¿Cuál es el personaje principal de The Legend of Zelda?", opciones: ["Link", "Zelda", "Ganon", "Mario"], respuestaCorrecta: "Link" }
    ],
    'Historia': [
      { pregunta: "¿En qué año terminó la Segunda Guerra Mundial?", opciones: ["1945", "1939", "1944", "1946"], respuestaCorrecta: "1945" },
      { pregunta: "¿Quién fue el primer presidente de Estados Unidos?", opciones: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "John Adams"], respuestaCorrecta: "George Washington" }
    ],
    'Deporte': [
      { pregunta: "¿Qué país ganó el Mundial de Fútbol de 2018?", opciones: ["Francia", "Croacia", "Brasil", "Alemania"], respuestaCorrecta: "Francia" },
      { pregunta: "¿Cuántos anillos tiene la bandera olímpica?", opciones: ["5", "4", "6", "7"], respuestaCorrecta: "5" }
    ],
    'Geografía': [
      { pregunta: "¿Cuál es el río más largo del mundo?", opciones: ["Nilo", "Amazonas", "Yangtsé", "Misisipi"], respuestaCorrecta: "Amazonas" },
      { pregunta: "¿Qué país tiene forma de bota?", opciones: ["Italia", "Portugal", "Chile", "Noruega"], respuestaCorrecta: "Italia" }
    ],
    'Trivia Mixta': [
      { pregunta: "¿Cuál es el elemento químico más abundante en la corteza terrestre?", opciones: ["Oxígeno", "Silicio", "Aluminio", "Hierro"], respuestaCorrecta: "Oxígeno" },
      { pregunta: "¿Cuál es la capital de Canadá?", opciones: ["Ottawa", "Toronto", "Montreal", "Vancouver"], respuestaCorrecta: "Ottawa" }
    ]
  };
  
  return questionsByTema[tema] || [
    { pregunta: "¿Cuál es la capital de Francia?", opciones: ["París", "Londres", "Madrid", "Roma"], respuestaCorrecta: "París" },
    { pregunta: "¿Cuántos planetas hay en el sistema solar?", opciones: ["8", "9", "7", "10"], respuestaCorrecta: "8" }
  ];
}

// Inicializar caché
TemaButton.cache = {};

export default TemaButton;