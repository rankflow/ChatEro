const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Configuración para PostgreSQL de Railway
const DATABASE_URL = "postgresql://postgres:MuCqBwxLOSdqFgIDmCxOVyPDtcKGPWjk@turntable.proxy.rlwy.net:48220/railway";

const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Función para conectar a SQLite
function connectToSQLite() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../prisma/prisma/dev.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// Función para leer avatares de SQLite
function getAvatarsFromSQLite(db) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id, name, description, personality, imageUrl, isPremium, 
        category, isActive, background, origin, age, occupation, 
        interests, fears, dreams, secrets, relationships, 
        lifeExperiences, personalityTraits, communicationStyle, 
        emotionalState, motivations, conflicts, growth, voiceType, 
        accent, mannerisms, style, scent, chatStyle, topics, 
        boundaries, kinks, roleplay, createdAt, updatedAt
      FROM avatars
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function migrateAvatars() {
  let sqliteDb;
  
  try {
    console.log('🔄 Iniciando migración de avatares de SQLite a PostgreSQL...');
    
    // Conectar a SQLite
    console.log('📖 Conectando a SQLite...');
    sqliteDb = await connectToSQLite();
    console.log('✅ Conectado a SQLite');
    
    // Leer avatares de SQLite
    console.log('📖 Leyendo avatares de SQLite...');
    const avatars = await getAvatarsFromSQLite(sqliteDb);
    
    console.log(`📊 Encontrados ${avatars.length} avatares en SQLite`);
    
    if (avatars.length === 0) {
      console.log('❌ No hay avatares para migrar');
      return;
    }
    
    // Mostrar los primeros avatares para verificar
    console.log('\n📋 Primeros avatares encontrados:');
    avatars.slice(0, 3).forEach((avatar, index) => {
      console.log(`${index + 1}. ${avatar.name} - ${avatar.description}`);
    });
    
    // Migrar cada avatar a PostgreSQL
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const avatar of avatars) {
      try {
        // Convertir fechas de SQLite a formato compatible con PostgreSQL
        const createdAt = avatar.createdAt ? new Date(avatar.createdAt) : new Date();
        const updatedAt = avatar.updatedAt ? new Date(avatar.updatedAt) : new Date();
        
        // Insertar en PostgreSQL
        await postgresPrisma.avatar.create({
          data: {
            id: avatar.id,
            name: avatar.name,
            description: avatar.description,
            personality: avatar.personality,
            imageUrl: avatar.imageUrl,
            isPremium: avatar.isPremium === 1, // SQLite usa 1/0, PostgreSQL usa true/false
            category: avatar.category,
            isActive: avatar.isActive === 1,
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
    // Cerrar conexiones
    if (sqliteDb) {
      sqliteDb.close((err) => {
        if (err) {
          console.error('Error cerrando SQLite:', err);
        } else {
          console.log('🔌 Conexión SQLite cerrada');
        }
      });
    }
    await postgresPrisma.$disconnect();
    console.log('🔌 Conexión PostgreSQL cerrada');
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