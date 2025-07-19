const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Función para conectar a SQLite
function connectToSQLite(dbPath, label) {
  return new Promise((resolve, reject) => {
    console.log(`📁 Conectando a ${label}: ${dbPath}`);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(`❌ Error conectando a ${label}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Conectado a ${label} exitosamente`);
        resolve(db);
      }
    });
  });
}

// Función para consultar la tabla avatar
function consultarAvatars(db, label) {
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
        console.error(`❌ Error consultando avatares en ${label}:`, err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Función para comparar avatares
function compararAvatars(avatars1, avatars2, label1, label2) {
  console.log(`\n🔍 COMPARANDO AVATARES:`);
  console.log(`📊 ${label1}: ${avatars1.length} avatares`);
  console.log(`📊 ${label2}: ${avatars2.length} avatares\n`);

  // Crear mapas por nombre para comparación
  const map1 = new Map(avatars1.map(a => [a.name, a]));
  const map2 = new Map(avatars2.map(a => [a.name, a]));

  // Avatares únicos en cada base de datos
  const soloEn1 = avatars1.filter(a => !map2.has(a.name));
  const soloEn2 = avatars2.filter(a => !map1.has(a.name));
  const enAmbas = avatars1.filter(a => map2.has(a.name));

  console.log(`📋 AVATARES ÚNICOS EN ${label1.toUpperCase()}:`);
  if (soloEn1.length === 0) {
    console.log('   Ninguno');
  } else {
    soloEn1.forEach(avatar => {
      console.log(`   - ${avatar.name} (ID: ${avatar.id})`);
    });
  }

  console.log(`\n📋 AVATARES ÚNICOS EN ${label2.toUpperCase()}:`);
  if (soloEn2.length === 0) {
    console.log('   Ninguno');
  } else {
    soloEn2.forEach(avatar => {
      console.log(`   - ${avatar.name} (ID: ${avatar.id})`);
    });
  }

  console.log(`\n📋 AVATARES EN AMBAS BASES DE DATOS:`);
  if (enAmbas.length === 0) {
    console.log('   Ninguno');
  } else {
    enAmbas.forEach(avatar => {
      const avatar2 = map2.get(avatar.name);
      console.log(`\n   --- ${avatar.name} ---`);
      console.log(`   ${label1}: ID=${avatar.id}, Edad=${avatar.age}, Ocupación=${avatar.occupation || 'N/A'}`);
      console.log(`   ${label2}: ID=${avatar2.id}, Edad=${avatar2.age}, Ocupación=${avatar2.occupation || 'N/A'}`);
      
      // Comparar campos importantes
      const diferencias = [];
      if (avatar.age !== avatar2.age) diferencias.push(`Edad: ${avatar.age} vs ${avatar2.age}`);
      if (avatar.occupation !== avatar2.occupation) diferencias.push(`Ocupación: ${avatar.occupation} vs ${avatar2.occupation}`);
      if (avatar.isPremium !== avatar2.isPremium) diferencias.push(`Premium: ${avatar.isPremium} vs ${avatar2.isPremium}`);
      if (avatar.isActive !== avatar2.isActive) diferencias.push(`Activo: ${avatar.isActive} vs ${avatar2.isActive}`);
      
      if (diferencias.length > 0) {
        console.log(`   ⚠️  Diferencias: ${diferencias.join(', ')}`);
      } else {
        console.log(`   ✅ Sin diferencias detectadas`);
      }
    });
  }

  return {
    soloEn1,
    soloEn2,
    enAmbas,
    total1: avatars1.length,
    total2: avatars2.length
  };
}

async function main() {
  let db1, db2;
  
  try {
    console.log('🔍 Comparando tablas avatar de ambas bases de datos...\n');
    
    // Rutas de las bases de datos
    const dbPath1 = path.join(__dirname, 'backend/prisma/dev.db');
    const dbPath2 = path.join(__dirname, 'backend/prisma/prisma/dev.db');
    
    // Conectar a ambas bases de datos
    db1 = await connectToSQLite(dbPath1, 'prisma/dev.db');
    db2 = await connectToSQLite(dbPath2, 'prisma/prisma/dev.db');
    
    // Consultar avatares de ambas bases de datos
    const avatars1 = await consultarAvatars(db1, 'prisma/dev.db');
    const avatars2 = await consultarAvatars(db2, 'prisma/prisma/dev.db');
    
    // Comparar avatares
    const resultado = compararAvatars(avatars1, avatars2, 'prisma/dev.db', 'prisma/prisma/dev.db');
    
    console.log(`\n📈 RESUMEN:`);
    console.log(`   Total en prisma/dev.db: ${resultado.total1}`);
    console.log(`   Total en prisma/prisma/dev.db: ${resultado.total2}`);
    console.log(`   Únicos en prisma/dev.db: ${resultado.soloEn1.length}`);
    console.log(`   Únicos en prisma/prisma/dev.db: ${resultado.soloEn2.length}`);
    console.log(`   En ambas: ${resultado.enAmbas.length}`);
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  } finally {
    // Cerrar conexiones
    if (db1) {
      db1.close((err) => {
        if (err) console.error('Error cerrando DB1:', err);
      });
    }
    if (db2) {
      db2.close((err) => {
        if (err) console.error('Error cerrando DB2:', err);
      });
    }
    console.log('\n🔌 Conexiones cerradas');
  }
}

// Ejecutar comparación
main()
  .then(() => {
    console.log('\n✅ Comparación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 