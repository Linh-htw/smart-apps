-- CreateTable
CREATE TABLE "Paket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bestellungId" INTEGER NOT NULL,
    "mitarbeiterId" INTEGER NOT NULL,
    "versandoption" TEXT NOT NULL,
    "versandkosten" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "versanddatum" DATETIME,
    "trackingnummer" TEXT,
    "zustelldatum" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Paket_bestellungId_fkey" FOREIGN KEY ("bestellungId") REFERENCES "Bestellung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Paket_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Paket_bestellungId_idx" ON "Paket"("bestellungId");

-- CreateIndex
CREATE INDEX "Paket_mitarbeiterId_idx" ON "Paket"("mitarbeiterId");

-- CreateIndex
CREATE INDEX "Paket_status_idx" ON "Paket"("status");

-- CreateIndex
CREATE INDEX "Paket_versanddatum_idx" ON "Paket"("versanddatum");

-- CreateIndex
CREATE INDEX "Paket_zustelldatum_idx" ON "Paket"("zustelldatum");
