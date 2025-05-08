# Study Buddy - Frontend

Este es el frontend de la aplicación Study Buddy, desarrollado con React, Vite y Tailwind CSS. Proporciona una interfaz de usuario intuitiva para interactuar con la API de Gemini.

## Tecnologías utilizadas

- **React 18**: Biblioteca de JavaScript para construir interfaces de usuario
- **Vite 4**: Herramienta de construcción rápida que proporciona un entorno de desarrollo más eficiente
- **Tailwind CSS 3**: Framework de CSS utilitario para diseño responsive
- **Axios 1.6**: Cliente HTTP para realizar peticiones a la API
- **React Icons 4.11**: Biblioteca para incorporar iconos populares en la aplicación React

## Características principales

- **Trivia de 5 temas**: Historia, Cultura, Deporte, Ciencia y Geografía
- **Preguntas generadas por IA**: Cada tema contiene 5 preguntas generadas dinámicamente
- **Múltiples formatos de pregunta**: Combinación de preguntas de opción múltiple y verdadero/falso
- **Evaluación instantánea**: Feedback inmediato sobre cada respuesta
- **Interfaz adaptable**: Diseño responsive que funciona en dispositivos móviles y de escritorio
- **Accesibilidad mejorada**: Soporte para navegación con teclado, alto contraste y tamaños de cursor personalizables
- **Fuentes locales**: Implementación de fuentes locales para evitar problemas de tracking prevention

## Estructura del proyecto

```
frontend/
├── public/
│   ├── graduation-cap.svg    # Ícono de la aplicación
│   └── fonts/                # Fuentes locales (Inter)
├── src/
│   ├── components/
│   │   ├── AccessibilityControls.jsx  # Controles de accesibilidad
│   │   ├── ApiStatusMonitor.jsx      # Monitor de estado de la API
│   │   ├── ChatPrompt.jsx            # Componente de chat
│   │   ├── Header.jsx                # Cabecera de la aplicación
│   │   ├── QuizQuestion.jsx          # Componente de preguntas
│   │   ├── SessionHistory.jsx        # Historial de sesiones
│   │   └── StudyAssistant.jsx        # Asistente de estudio
│   ├── utils/
│   │   ├── createFontsDir.js         # Script para crear directorio de fuentes
│   │   └── downloadFonts.js          # Script para descargar fuentes
│   ├── App.css                       # Estilos específicos de la aplicación
│   ├── App.jsx                       # Componente principal
│   ├── index.css                     # Estilos globales
│   ├── accessibility.css             # Estilos de accesibilidad
│   ├── cursor.css                    # Estilos del cursor personalizado
│   ├── fonts.css                     # Configuración de fuentes
│   └── main.jsx                      # Punto de entrada de React
├── .env                              # Variables de entorno (desarrollo)
├── .env.production                   # Variables de entorno (producción)
├── check-deps.js                     # Script para verificar dependencias
├── index.html                        # Plantilla HTML
├── package.json                      # Dependencias y scripts
├── postcss.config.js                 # Configuración de PostCSS
├── tailwind.config.js                # Configuración de Tailwind CSS
├── vercel.json                       # Configuración para despliegue en Vercel
└── vite.config.js                    # Configuración de Vite
```

## Requisitos previos

- Node.js (v14 o superior)
- npm o yarn

## Configuración

1. Clona el repositorio:

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución

### Modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

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

Puedes modificar los colores y el tema editando el archivo `tailwind.config.js`. El proyecto utiliza una combinación de colores púrpura e índigo que puedes ajustar según tus preferencias.

### Comportamiento del chat

El componente principal `ChatPrompt.jsx` controla la funcionalidad del chat. Puedes modificar:

- El número máximo de tokens en la respuesta
- El comportamiento de auto-scroll
- El formateo de los mensajes
- Los efectos visuales de carga

## Conexión con el backend

El frontend está configurado para conectarse a un backend desplegado en Vercel:

```javascript
const res = await axios.post('https://chatgptback.vercel.app/api/chat', { prompt })
```

Para desarrollo local, modifica la URL en `ChatPrompt.jsx` o utiliza el proxy configurado en `vite.config.js`.

## Estilos

El proyecto utiliza Tailwind CSS para los estilos, con algunas personalizaciones adicionales en:

- `src/index.css`: Configuración global de Tailwind y estilos base
- `src/App.css`: Animaciones y estilos específicos de la aplicación

## Solución al error de Tracking Prevention con las fuentes

Para solucionar el error "Tracking Prevention blocked access to storage for fonts.gstatic.com", hemos implementado el uso de fuentes locales en lugar de depender de Google Fonts.

### Instrucciones para configurar las fuentes locales:

1. Crea un directorio `public/fonts` en la raíz del proyecto frontend:

```bash
mkdir -p public/fonts
```

2. Descarga manualmente los archivos de fuente Inter desde Google Fonts y colócalos en el directorio `public/fonts` con los siguientes nombres:

- Inter-Light.woff2
- Inter-Regular.woff2
- Inter-Medium.woff2
- Inter-SemiBold.woff2
- Inter-Bold.woff2

Alternativamente, puedes ejecutar el script de descarga:

```bash
node src/utils/downloadFonts.js
```

3. Las fuentes se cargarán automáticamente desde el directorio local cuando se inicie la aplicación.

## Despliegue

Este frontend puede desplegarse en plataformas como:

- **Vercel**: Compatible con Vite, despliegue automático
- **Netlify**: Despliegue sencillo con soporte para SPA
- **GitHub Pages**: Requiere configuración adicional

## Mejores prácticas implementadas

- **Componentes reutilizables**: Estructura modular para facilitar mantenimiento
- **Estados y efectos optimizados**: Uso adecuado de hooks de React
- **UI/UX mejorada**: Animaciones sutiles, feedback visual para acciones
- **Manejo de errores**: Feedback al usuario cuando ocurren problemas
- **Renderizado condicional**: Diferentes vistas según el estado de la aplicación

# triviamantica-fronted
