-- CreateTable
CREATE TABLE "Bestellposition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bestellungId" INTEGER NOT NULL,
    "produktId" INTEGER NOT NULL,
    "chargeId" INTEGER NOT NULL,
    "menge" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bestellposition_bestellungId_fkey" FOREIGN KEY ("bestellungId") REFERENCES "Bestellung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellposition_produktId_fkey" FOREIGN KEY ("produktId") REFERENCES "Produkt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellposition_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Bestellposition_bestellungId_idx" ON "Bestellposition"("bestellungId");

-- CreateIndex
CREATE INDEX "Bestellposition_produktId_idx" ON "Bestellposition"("produktId");

-- CreateIndex
CREATE INDEX "Bestellposition_chargeId_idx" ON "Bestellposition"("chargeId");
