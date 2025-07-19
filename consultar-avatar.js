const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Función para conectar a SQLite
function connectToSQLite() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'backend/prisma/prisma/dev.db');
    console.log('📁 Ruta de la base de datos:', dbPath);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error conectando a SQLite:', err.message);
        reject(err);
      } else {
        console.log('✅ Conectado a SQLite exitosamente');
        resolve(db);
      }
    });
  });
}

// Función para consultar la tabla avatar
function consultarAvatars(db) {
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
      ORDER BY name
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('❌ Error consultando avatares:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function main() {
  let db;
  
  try {
    console.log('🔍 Consultando tabla avatar...\n');
    
    // Conectar a SQLite
    db = await connectToSQLite();
    
    // Consultar avatares
    const avatars = await consultarAvatars(db);
    
    console.log(`📊 Total de avatares encontrados: ${avatars.length}\n`);
    
    if (avatars.length === 0) {
      console.log('❌ No hay avatares en la base de datos');
      return;
    }
    
    // Mostrar información de cada avatar
    avatars.forEach((avatar, index) => {
      console.log(`\n--- AVATAR ${index + 1} ---`);
      console.log(`ID: ${avatar.id}`);
      console.log(`Nombre: ${avatar.name}`);
      console.log(`Descripción: ${avatar.description}`);
      console.log(`Personalidad: ${avatar.personality}`);
      console.log(`Premium: ${avatar.isPremium ? 'Sí' : 'No'}`);
      console.log(`Categoría: ${avatar.category}`);
      console.log(`Activo: ${avatar.isActive ? 'Sí' : 'No'}`);
      console.log(`Imagen: ${avatar.imageUrl}`);
      console.log(`Edad: ${avatar.age || 'No especificada'}`);
      console.log(`Ocupación: ${avatar.occupation || 'No especificada'}`);
      console.log(`Creado: ${avatar.createdAt}`);
      console.log(`Actualizado: ${avatar.updatedAt}`);
    });
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  } finally {
    // Cerrar conexión
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error cerrando SQLite:', err);
        } else {
          console.log('\n🔌 Conexión SQLite cerrada');
        }
      });
    }
  }
}

// Ejecutar consulta
main()
  .then(() => {
    console.log('\n✅ Consulta completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 