-- CreateTable
CREATE TABLE "Retoure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bestellpositionId" INTEGER NOT NULL,
    "grund" TEXT,
    "produktzustand" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "erstattungsart" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Retoure_bestellpositionId_fkey" FOREIGN KEY ("bestellpositionId") REFERENCES "Bestellposition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Retoure_bestellpositionId_idx" ON "Retoure"("bestellpositionId");

-- CreateIndex
CREATE INDEX "Retoure_produktzustand_idx" ON "Retoure"("produktzustand");

-- CreateIndex
CREATE INDEX "Retoure_status_idx" ON "Retoure"("status");

-- CreateIndex
CREATE INDEX "Retoure_erstattungsart_idx" ON "Retoure"("erstattungsart");
