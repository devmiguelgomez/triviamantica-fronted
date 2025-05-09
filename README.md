# Triviamantica - Frontend

Este es el frontend de la aplicación Triviamantica, un juego de preguntas y respuestas desarrollado con React, Vite y Tailwind CSS. Proporciona una interfaz de usuario intuitiva para poner a prueba tus conocimientos en diferentes categorías.

## Tecnologías utilizadas

- **React 18**: Biblioteca de JavaScript para construir interfaces de usuario
- **Vite 4**: Herramienta de construcción rápida que proporciona un entorno de desarrollo más eficiente
- **Tailwind CSS 3**: Framework de CSS utilitario para diseño responsive
- **Axios 1.6**: Cliente HTTP para realizar peticiones a la API
- **React Icons 4**: Biblioteca para incorporar iconos populares en la aplicación React

## Características principales

- **Trivia multitemática**: Preguntas sobre Historia, Ciencia, Arte, Deportes y Geografía
- **Múltiples formatos de pregunta**: Combinación de preguntas de opción múltiple y verdadero/falso
- **Evaluación instantánea**: Feedback inmediato sobre cada respuesta
- **Interfaz adaptable**: Diseño responsive que funciona en dispositivos móviles y de escritorio
- **Sistema de puntuación**: Seguimiento de aciertos y fallos para medir tu progreso
- **Fuentes locales**: Implementación de fuentes locales para mejorar el rendimiento

## Estructura del proyecto

```
triviamantica-fronted/
├── dist/                      # Archivos compilados para producción
├── node_modules/              # Dependencias instaladas
├── public/                    # Archivos estáticos públicos
│   ├── fonts/                 # Fuentes locales
│   └── graduation-cap.svg     # Ícono de la aplicación
├── src/
│   ├── components/            # Componentes React
│   │   ├── AccessibilityControls.jsx  # Controles de accesibilidad
│   │   ├── AccessibilityCursor.jsx    # Cursor personalizado para accesibilidad
│   │   ├── ApiStatusMonitor.jsx       # Monitor de estado de la API
│   │   ├── ChatPrompt.jsx             # Componente para interacción con el chat
│   │   ├── EnableCursor.jsx           # Control de cursor personalizado
│   │   ├── Header.jsx                 # Cabecera de la aplicación
│   │   ├── QuizQuestion.jsx           # Componente para mostrar preguntas de la trivia
│   │   ├── SessionHistory.jsx         # Historial de sesiones anteriores
│   │   └── StudyAssistant.jsx         # Componente principal de la trivia
│   ├── services/              # Servicios para comunicación con el backend
│   │   └── apiService.js      # Servicios de API para comunicación con el backend
│   ├── utils/                 # Utilidades y funciones auxiliares
│   │   ├── createFontsDirjs   # Utilidad para gestionar fuentes
│   │   └── cursorUtils.js     # Utilidades para manejo del cursor
│   ├── accessibility.css      # Estilos para funcionalidades de accesibilidad
│   ├── App.css                # Estilos específicos de la aplicación
│   ├── App.jsx                # Componente principal
│   ├── cursor.css             # Estilos para el cursor personalizado
│   ├── fonts.css              # Configuración de fuentes
│   ├── index.css              # Estilos globales incluyendo Tailwind
│   └── main.jsx               # Punto de entrada de React
├── check-deps.js              # Script para verificar dependencias
├── index.html                 # Plantilla HTML principal
├── package-lock.json          # Versiones exactas de dependencias
├── package.json               # Dependencias y scripts
├── postcss.config.js          # Configuración de PostCSS
├── README.md                  # Documentación del proyecto
├── reset.js                   # Script para restablecer configuraciones
├── tailwind.config.js         # Configuración de Tailwind CSS
├── vercel.json                # Configuración para despliegue en Vercel
└── vite.config.js             # Configuración de Vite
```

## Requisitos previos

- Node.js (v14 o superior)
- npm o yarn

## Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/devmiguelgomez/triviamantica-fronted.git
   cd triviamantica-fronted
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución

### Modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Construir para producción:
```bash
npm run build
```

### Previsualizar la versión de producción:
```bash
npm run preview
```

## Personalización

### Colores y tema

Puedes modificar los colores y el tema editando el archivo `tailwind.config.js`. El proyecto utiliza una combinación de colores que puedes ajustar según tus preferencias.

## Conexión con el backend

El frontend está configurado para conectarse al backend de Triviamantica:

```javascript
const res = await axios.post('https://triviamantica-backend.vercel.app/api/questions', { category })
```

Para desarrollo local, modifica la URL en los archivos de servicios o utiliza el proxy configurado en `vite.config.js`.

## Despliegue

Este frontend puede desplegarse en plataformas como:

- **Vercel**: Compatible con Vite, despliegue automático
- **GitHub Pages**: Requiere configuración adicional

## Solución de problemas

Si encuentras problemas durante la instalación o ejecución, puedes utilizar el script de verificación:

```bash
node check-deps.js
```

Este script verificará si todas las dependencias y archivos esenciales están correctamente configurados.
