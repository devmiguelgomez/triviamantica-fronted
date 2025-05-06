import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio para almacenar las fuentes
const fontsDir = path.join(__dirname, '..', '..', 'public', 'fonts');

// Crear directorio si no existe
if (!fs.existsSync(fontsDir)) {
  try {
    fs.mkdirSync(fontsDir, { recursive: true });
    console.log(`✅ Directorio de fuentes creado: ${fontsDir}`);
  } catch (err) {
    console.error(`❌ Error creando directorio de fuentes:`, err);
  }
}
