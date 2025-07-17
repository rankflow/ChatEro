import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Función para leer archivo JSON
function readJsonFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error leyendo archivo ${filePath}:`, error);
    return null;
  }
}

// Función para migrar un avatar desde JSON a BD
async function migrateAvatarFromJson(avatarName: string) {
  const jsonPath = path.join(process.cwd(), 'src', 'prompts', 'avatars', 'extended', `${avatarName}_extended.json`);
  
  console.log(`📁 Leyendo archivo: ${jsonPath}`);
  
  if (!fs.existsSync(jsonPath)) {
    console.log(`❌ Archivo no encontrado: ${jsonPath}`);
    return false;
  }
  
  const jsonData = readJsonFile(jsonPath);
  if (!jsonData) {
    console.log(`❌ Error leyendo JSON para ${avatarName}`);
    return false;
  }
  
  console.log(`📊 Datos encontrados para ${avatarName}:`, Object.keys(jsonData));
  
  // Preparar datos para la base de datos
  const avatarData = {
    name: avatarName.charAt(0).toUpperCase() + avatarName.slice(1), // Capitalizar primera letra
    description: jsonData.description || '',
    personality: jsonData.personality || '',
    imageUrl: jsonData.imageUrl || `https://via.placeholder.com/400x600/FF69B4/FFFFFF?text=${avatarName}`,
    isPremium: jsonData.isPremium || false,
    category: jsonData.category || 'Misteriosa',
    isActive: true,
    background: jsonData.background || '',
    origin: jsonData.origin || '',
    age: jsonData.age || null,
    occupation: jsonData.occupation || '',
    interests: jsonData.interests || '',
    fears: jsonData.fears || '',
    dreams: jsonData.dreams || '',
    secrets: jsonData.secrets || '',
    relationships: jsonData.relationships || '',
    lifeExperiences: jsonData.lifeExperiences || '',
    personalityTraits: jsonData.personalityTraits || '',
    communicationStyle: jsonData.communicationStyle || '',
    emotionalState: jsonData.emotionalState || '',
    motivations: jsonData.motivations || '',
    conflicts: jsonData.conflicts || '',
    growth: jsonData.growth || '',
    voiceType: jsonData.voiceType || '',
    accent: jsonData.accent || '',
    mannerisms: jsonData.mannerisms || '',
    style: jsonData.style || '',
    scent: jsonData.scent || '',
    chatStyle: jsonData.chatStyle || '',
    topics: jsonData.topics || '',
    boundaries: jsonData.boundaries || '',
    kinks: jsonData.kinks || '',
    roleplay: jsonData.roleplay || ''
  };
  
  try {
    // Buscar avatar existente
    const existingAvatar = await prisma.avatar.findFirst({
      where: { name: avatarData.name }
    });
    
    if (existingAvatar) {
      console.log(`🔄 Actualizando avatar ${avatarName} en base de datos...`);
      await prisma.avatar.update({
        where: { id: existingAvatar.id },
        data: avatarData
      });
    } else {
      console.log(`🌱 Creando avatar ${avatarName} en base de datos...`);
      await prisma.avatar.create({
        data: avatarData
      });
    }
    
    console.log(`✅ Avatar ${avatarName} migrado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error migrando avatar ${avatarName}:`, error);
    return false;
  }
}

// Función principal de migración
async function migrateAllAvatars() {
  console.log('🚀 Iniciando migración de JSON a Base de Datos...');
  
  // Lista de avatares a migrar
  const avatars = ['aria', 'luna', 'sofia', 'venus'];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const avatar of avatars) {
    console.log(`\n📋 Procesando avatar: ${avatar}`);
    const success = await migrateAvatarFromJson(avatar);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`\n📊 Resumen de migración:`);
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Total procesados: ${avatars.length}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('💡 Ahora puedes eliminar los archivos JSON extended');
  } else {
    console.log('\n⚠️  Algunos avatares tuvieron errores. Revisa los logs.');
  }
}

// Ejecutar migración
migrateAllAvatars()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 