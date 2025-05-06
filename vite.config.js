import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Para que sea accesible también desde red local
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild', // Cambiado de 'terser' a 'esbuild' que es el minificador nativo de Vite
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['react-icons', 'axios']
        }
      }
    },
  },
  // Mejor manejo de errores
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-icons']
  }
})
