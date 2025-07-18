const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Configuración para SQLite local
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

// Configuración para PostgreSQL de Railway
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:MuCqBwxLOSdqFgIDmCxOVyPDtcKGPWjk@postgres.railway.internal:5432/railway"
    }
  }
});

async function migrateAvatars() {
  try {
    console.log('🔄 Iniciando migración de avatares de SQLite a PostgreSQL...');
    
    // Leer todos los avatares de SQLite
    console.log('📖 Leyendo avatares de SQLite...');
    const avatars = await sqlitePrisma.avatar.findMany();
    
    console.log(`📊 Encontrados ${avatars.length} avatares en SQLite`);
    
    if (avatars.length === 0) {
      console.log('❌ No hay avatares para migrar');
      return;
    }
    
    // Migrar cada avatar a PostgreSQL
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const avatar of avatars) {
      try {
        // Convertir fechas de SQLite a formato compatible con PostgreSQL
        const createdAt = avatar.createdAt instanceof Date ? avatar.createdAt : new Date(avatar.createdAt);
        const updatedAt = avatar.updatedAt instanceof Date ? avatar.updatedAt : new Date(avatar.updatedAt);
        
        // Insertar en PostgreSQL
        await postgresPrisma.avatar.create({
          data: {
            id: avatar.id,
            name: avatar.name,
            description: avatar.description,
            personality: avatar.personality,
            imageUrl: avatar.imageUrl,
            isPremium: avatar.isPremium,
            category: avatar.category,
            isActive: avatar.isActive,
            background: avatar.background,
            origin: avatar.origin,
            age: avatar.age,
            occupation: avatar.occupation,
            interests: avatar.interests,
            fears: avatar.fears,
            dreams: avatar.dreams,
            secrets: avatar.secrets,
            relationships: avatar.relationships,
            lifeExperiences: avatar.lifeExperiences,
            personalityTraits: avatar.personalityTraits,
            communicationStyle: avatar.communicationStyle,
            emotionalState: avatar.emotionalState,
            motivations: avatar.motivations,
            conflicts: avatar.conflicts,
            growth: avatar.growth,
            voiceType: avatar.voiceType,
            accent: avatar.accent,
            mannerisms: avatar.mannerisms,
            style: avatar.style,
            scent: avatar.scent,
            chatStyle: avatar.chatStyle,
            topics: avatar.topics,
            boundaries: avatar.boundaries,
            kinks: avatar.kinks,
            roleplay: avatar.roleplay,
            createdAt: createdAt,
            updatedAt: updatedAt
          }
        });
        
        console.log(`✅ Migrado avatar: ${avatar.name} (ID: ${avatar.id})`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrando avatar ${avatar.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Resumen de migración:');
    console.log(`✅ Avatares migrados exitosamente: ${migratedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesados: ${avatars.length}`);
    
  } catch (error) {
    console.error('💥 Error general en la migración:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
    console.log('🔌 Conexiones cerradas');
  }
}

// Ejecutar la migración
migrateAvatars()
  .then(() => {
    console.log('🎉 Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 