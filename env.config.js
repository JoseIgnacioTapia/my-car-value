import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Determina el entorno actual
const env = process.env.NODE_ENV || 'development';

// Construye la ruta al archivo .env correspondiente
const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

// Verifica si el archivo existe
if (!fs.existsSync(envFilePath)) {
  throw new Error(`Environment file not found: ${envFilePath}`);
}

// Carga las variables de entorno desde el archivo correspondiente
dotenv.config({ path: envFilePath });

console.log(`Loaded environment variables from: ${envFilePath}`);
