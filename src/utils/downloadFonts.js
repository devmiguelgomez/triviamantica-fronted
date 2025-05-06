import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.join(__dirname, '..', '..', 'public', 'fonts');

// Crear directorio si no existe
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// URLs de las fuentes que queremos descargar
const fontFiles = [
  {
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Light.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Regular.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Medium.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-SemiBold.woff2'
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2',
    filename: 'Inter-Bold.woff2'
  }
];

// Función para descargar una fuente
const downloadFont = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(fontsDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Fuente descargada: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Eliminar el archivo parcialmente descargado
      console.error(`❌ Error descargando ${filename}:`, err.message);
      reject(err);
    });
  });
};

// Descargar todas las fuentes
const downloadAllFonts = async () => {
  console.log('Descargando fuentes...');
  
  for (const font of fontFiles) {
    try {
      await downloadFont(font.url, font.filename);
    } catch (error) {
      console.error(`Error con ${font.filename}:`, error);
    }
  }
  
  console.log('✨ Descarga de fuentes completada');
};

downloadAllFonts();
