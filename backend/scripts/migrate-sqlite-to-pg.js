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

async function migrateTable(sqliteDb, table, prismaModel) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(`SELECT * FROM ${table}`, async (err, rows) => {
      if (err) return reject(err);
      for (const row of rows) {
        try {
          // Elimina campos nulos que puedan causar problemas
          Object.keys(row).forEach(key => row[key] === null && delete row[key]);
          await pgPrisma[prismaModel].create({ data: row });
        } catch (e) {
          console.error(`Error insertando en ${prismaModel}:`, e.message);
        }
      }
      console.log(`Migración de ${table} completada (${rows.length} registros)`);
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