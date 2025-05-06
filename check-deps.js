const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verificando dependencias y configuración del proyecto...');

// Verificar archivos esenciales
const essentialFiles = [
  'index.html',
  'src/main.jsx',
  'src/App.jsx'
];

for (const file of essentialFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ No se encontró el archivo esencial: ${file}`);
  } else {
    console.log(`✅ Archivo encontrado: ${file}`);
  }
}

// Verificar package.json y dependencias
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ No se encontró el archivo package.json');
} else {
  console.log('✅ Archivo package.json encontrado');
  
  try {
    const packageJson = require(packageJsonPath);
    console.log('📦 Dependencias requeridas:');
    
    const requiredDeps = ['react', 'react-dom', 'react-icons'];
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`❌ Falta ${dep}`);
      }
    }
  } catch (err) {
    console.error('❌ Error al leer package.json:', err.message);
  }
}

// Verificar node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ No se encontró la carpeta node_modules. Ejecute npm install');
} else {
  console.log('✅ Carpeta node_modules encontrada');
}

console.log('\n🔧 Solución recomendada si hay problemas:');
console.log('1. Elimine la carpeta node_modules y package-lock.json');
console.log('2. Ejecute: npm install');
console.log('3. Ejecute: npm run dev');

console.log('\n🔍 Verificación completada');
