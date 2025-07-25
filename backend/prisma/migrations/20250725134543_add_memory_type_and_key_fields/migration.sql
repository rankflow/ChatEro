/*
  Warnings:

  - Added the required column `categoryId` to the `user_memory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "memory_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "memory_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "memory_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL DEFAULT 'general',
    "memoryKey" TEXT,
    "categoryId" INTEGER NOT NULL,
    "memoryContent" TEXT NOT NULL,
    "memoryVector" TEXT NOT NULL,
    "memoryOwner" TEXT NOT NULL DEFAULT 'user',
    "source" TEXT NOT NULL DEFAULT 'batch_analysis',
    "sessionId" TEXT,
    "turnCount" INTEGER,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_memory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "memory_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_memory_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "avatars" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_memory" ("avatarId", "confidence", "createdAt", "id", "lastUpdated", "memoryContent", "memoryKey", "memoryType", "memoryVector", "userId") SELECT "avatarId", "confidence", "createdAt", "id", "lastUpdated", "memoryContent", "memoryKey", "memoryType", "memoryVector", "userId" FROM "user_memory";
DROP TABLE "user_memory";
ALTER TABLE "new_user_memory" RENAME TO "user_memory";
CREATE INDEX "user_memory_userId_avatarId_memoryOwner_confidence_idx" ON "user_memory"("userId", "avatarId", "memoryOwner", "confidence");
CREATE INDEX "user_memory_categoryId_isActive_idx" ON "user_memory"("categoryId", "isActive");
CREATE INDEX "user_memory_memoryType_idx" ON "user_memory"("memoryType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
