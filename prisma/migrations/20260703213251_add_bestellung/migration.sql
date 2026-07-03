-- CreateTable
CREATE TABLE "Bestellung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kundeId" INTEGER NOT NULL,
    "datum" DATETIME NOT NULL,
    "kanal" TEXT NOT NULL,
    "lieferadresse" TEXT,
    "zahlungsstatus" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bestellung_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Bestellung_kundeId_idx" ON "Bestellung"("kundeId");

-- CreateIndex
CREATE INDEX "Bestellung_kanal_idx" ON "Bestellung"("kanal");

-- CreateIndex
CREATE INDEX "Bestellung_zahlungsstatus_idx" ON "Bestellung"("zahlungsstatus");

-- CreateIndex
CREATE INDEX "Bestellung_status_idx" ON "Bestellung"("status");

-- CreateIndex
CREATE INDEX "Bestellung_datum_idx" ON "Bestellung"("datum");
