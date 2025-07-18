const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

const sqliteDbPath = './prisma/dev.db'; // Ruta a tu SQLite local
const pgPrisma = new PrismaClient(); // Usará la DATABASE_URL actual (PostgreSQL)

const TABLES = [
  { name: 'users', prisma: 'user' },
  { name: 'tokens', prisma: 'token' },
  { name: 'payments', prisma: 'payment' },
  { name: 'avatars', prisma: 'avatar' },
  { name: 'messages', prisma: 'message' },
  { name: 'sessions', prisma: 'session' }
];

// Función para convertir datos de SQLite a PostgreSQL
function convertDataForPostgres(row) {
  const converted = { ...row };
  
  // Convertir timestamps a fechas
  if (converted.createdAt) {
    converted.createdAt = new Date(converted.createdAt);
  }
  if (converted.updatedAt) {
    converted.updatedAt = new Date(converted.updatedAt);
  }
  if (converted.expiresAt) {
    converted.expiresAt = new Date(converted.expiresAt);
  }
  
  // Convertir booleanos (0/1 a true/false)
  if (typeof converted.isPremium !== 'undefined') {
    converted.isPremium = !!converted.isPremium;
  }
  if (typeof converted.isActive !== 'undefined') {
    converted.isActive = !!converted.isActive;
  }
  if (typeof converted.isUser !== 'undefined') {
    converted.isUser = !!converted.isUser;
  }
  
  // Eliminar campos nulos
  Object.keys(converted).forEach(key => {
    if (converted[key] === null) {
      delete converted[key];
    }
  });
  
  return converted;
}

async function migrateTable(sqliteDb, table, prismaModel) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(`SELECT * FROM ${table}`, async (err, rows) => {
      if (err) return reject(err);
      
      let successCount = 0;
      for (const row of rows) {
        try {
          const convertedData = convertDataForPostgres(row);
          await pgPrisma[prismaModel].create({ data: convertedData });
          successCount++;
        } catch (e) {
          console.error(`Error insertando en ${prismaModel}:`, e.message);
        }
      }
      console.log(`Migración de ${table} completada (${successCount}/${rows.length} registros exitosos)`);
      resolve();
    });
  });
}

async function main() {
  const sqliteDb = new sqlite3.Database(sqliteDbPath);

  for (const { name, prisma } of TABLES) {
    await migrateTable(sqliteDb, name, prisma);
  }

  sqliteDb.close();
  await pgPrisma.$disconnect();
  console.log('¡Migración completa!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 