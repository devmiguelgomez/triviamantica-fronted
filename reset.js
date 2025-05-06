const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Iniciando reinicio de la configuración de la aplicación...');

// Rutas a eliminar
const pathsToDelete = [
  'node_modules',
  'package-lock.json',
  '.vite',
  'dist'
];

// Eliminar archivos y carpetas especificados
for (const pathToDelete of pathsToDelete) {
  const fullPath = path.join(__dirname, pathToDelete);
  
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        console.log(`🗑️  Eliminando directorio: ${pathToDelete}...`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        console.log(`🗑️  Eliminando archivo: ${pathToDelete}...`);
        fs.unlinkSync(fullPath);
      }
      console.log(`✅ ${pathToDelete} eliminado correctamente`);
    } catch (err) {
      console.error(`❌ Error al eliminar ${pathToDelete}:`, err.message);
    }
  } else {
    console.log(`ℹ️  ${pathToDelete} no existe, saltando...`);
  }
}

// Reinstalar dependencias
console.log('\n📦 Reinstalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias reinstaladas correctamente');
} catch (err) {
  console.error('❌ Error al reinstalar dependencias:', err.message);
}

console.log('\n🔄 Reinicio completado. Ejecute "npm run dev" para iniciar la aplicación.');
