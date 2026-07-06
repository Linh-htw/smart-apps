-- CreateTable
CREATE TABLE "Mitarbeiter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "zugriffsrechte" TEXT,
    "email" TEXT,
    "telefonnummer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Mitarbeiter_rolle_idx" ON "Mitarbeiter"("rolle");
