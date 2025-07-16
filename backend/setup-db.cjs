const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Leer el archivo env
const envPath = path.join(__dirname, 'env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parsear las variables de entorno
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Remover comillas si las hay
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    envVars[key] = value;
  }
});

// Configurar las variables de entorno
Object.keys(envVars).forEach(key => {
  process.env[key] = envVars[key];
});

console.log('🔧 Configurando base de datos...');
console.log('📁 DATABASE_URL:', process.env.DATABASE_URL);

try {
  // Generar cliente Prisma
  console.log('📦 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Crear base de datos
  console.log('🗄️  Creando base de datos...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Base de datos configurada correctamente!');
} catch (error) {
  console.error('❌ Error configurando la base de datos:', error.message);
  process.exit(1);
} 