-- CreateTable
CREATE TABLE "Lagerbestand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargeId" INTEGER NOT NULL,
    "lagerort" TEXT NOT NULL,
    "mengeVoruebergehendReserviert" INTEGER NOT NULL DEFAULT 0,
    "mengeVerbindlichReserviert" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lagerbestand_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lagerbestand_chargeId_lagerort_key" ON "Lagerbestand"("chargeId", "lagerort");

-- CreateIndex
CREATE INDEX "Lagerbestand_chargeId_idx" ON "Lagerbestand"("chargeId");

-- CreateIndex
CREATE INDEX "Lagerbestand_lagerort_idx" ON "Lagerbestand"("lagerort");
