# Trivia Mántica - Frontend

Aplicación interactiva de preguntas y respuestas que utiliza IA para generar trivias dinámicas sobre diferentes temas.

![Trivia Mántica](https://via.placeholder.com/800x400?text=Trivia+M%C3%A1ntica)

## ✨ Características principales

- Interfaz de usuario moderna e intuitiva desarrollada con React y Bootstrap
- 6 categorías de preguntas: Cultura, Videojuegos, Historia, Deporte, Geografía y Trivia Mixta
- Generación dinámica de preguntas utilizando IA (Gemini)
- Preguntas de opción múltiple y de tipo verdadero/falso
- Retroalimentación visual inmediata para respuestas correctas e incorrectas
- Modo "Trivia Mixta" con preguntas de todas las categorías
- Sistema de puntuación y resumen final
- Funciona de forma degradada incluso sin conexión al backend

## 🚀 Instalación y ejecución

1. Clonar el repositorio
2. Instalar dependencias:

```bash
npm install
```

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

4. Abrir [http://localhost:5173](http://localhost:5173) en el navegador

## 📦 Construcción para producción

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/`.

## 📂 Estructura del proyecto

```
triviamantica-frontend/
├── public/            # Archivos estáticos
├── src/               # Código fuente
│   ├── components/    # Componentes React
│   │   ├── Preguntas.jsx     # Componente para mostrar preguntas
│   │   └── TemaButton.jsx    # Botón para seleccionar tema
│   ├── App.jsx        # Componente principal
│   ├── App.css        # Estilos CSS
│   └── main.jsx       # Punto de entrada
├── index.html         # HTML principal
├── package.json       # Dependencias y scripts
└── README.md          # Este archivo
```

## 🧩 Componentes principales

### `App.jsx`

Componente principal que gestiona:
- Estado global de la aplicación
- Selección de temas
- Comunicación con el backend
- Manejo de errores y estados de carga

### `TemaButton.jsx`

Maneja:
- Solicitudes al backend para obtener preguntas
- Caché de preguntas para mejorar el rendimiento
- Lógica para generar preguntas mixtas
- Fallbacks para casos de error o sin conexión

### `Preguntas.jsx`

Se encarga de:
- Mostrar las preguntas y opciones de respuesta
- Verificar y mostrar resultados de respuestas
- Controlar el flujo del juego
- Mostrar puntuaciones finales

## 🎮 Categorías de trivia

| Categoría | Descripción | Ícono |
|-----------|-------------|-------|
| Cultura | Arte, literatura y música | 🎭 |
| Videojuegos | Conocimientos sobre juegos | 🎮 |
| Historia | Eventos y personajes históricos | 📜 |
| Deporte | Todo sobre deportes | ⚽ |
| Geografía | Países, ciudades y accidentes geográficos | 🌍 |
| Trivia Mixta | Combinación de todas las categorías | 🎲 |

## ⚡ Funcionalidades especiales

### Trivia Mixta

La opción "Trivia Mixta" presenta una pregunta de cada categoría:
- Cultura
- Videojuegos
- Historia
- Deporte
- Geografía

Además, incluye preguntas de tipo verdadero/falso para una experiencia más diversa.

### Preguntas tipo Verdadero/Falso

Además de las preguntas de opción múltiple, la aplicación incluye preguntas de tipo verdadero/falso que se presentan con un diseño especial adaptado a este formato.

### Modo sin conexión

Si no hay conexión al backend:
- La aplicación muestra un aviso al usuario
- Genera preguntas localmente para cada categoría
- Permite jugar sin interrupciones

### Feedback visual

- Animaciones al seleccionar respuestas
- Efectos de confeti al completar una categoría
- Códigos de colores para respuestas correctas e incorrectas
- Barra de progreso para ver avance en la categoría

## 📡 Comunicación con el backend

La aplicación se conecta a un backend Node.js + Express que:
- Genera preguntas dinámicamente usando Gemini AI
- Almacena preguntas para cada tema
- Proporciona API RESTful para obtener trivias

## 🛠️ Tecnologías utilizadas

- **React**: Biblioteca para construir la interfaz de usuario
- **Vite**: Herramienta de desarrollo rápida
- **Bootstrap / React-Bootstrap**: Framework CSS para el diseño
- **Axios**: Cliente HTTP para comunicación con el backend
- **Canvas Confetti**: Efectos visuales de celebración

## 👤 Desarrollador

Miguel Gómez - 2025
