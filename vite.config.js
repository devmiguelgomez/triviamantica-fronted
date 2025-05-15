import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Configuración para mejorar la compatibilidad
    target: 'es2015',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  // Mejorar manejo de archivos estáticos
  publicDir: 'public',
  // Configuración para Vercel
  ssr: {
    noExternal: ['react-bootstrap']
  }
})
