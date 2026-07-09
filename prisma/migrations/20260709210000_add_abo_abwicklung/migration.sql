-- CreateTable
CREATE TABLE "AboAbwicklung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jahr" INTEGER NOT NULL,
    "monat" INTEGER NOT NULL,
    "ausgefuehrtAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- AlterTable
ALTER TABLE "Bestellung" ADD COLUMN "aboAbwicklungId" INTEGER REFERENCES "AboAbwicklung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "AboAbwicklung_jahr_monat_key" ON "AboAbwicklung"("jahr", "monat");

-- CreateIndex
CREATE INDEX "AboAbwicklung_ausgefuehrtAm_idx" ON "AboAbwicklung"("ausgefuehrtAm");

-- CreateIndex
CREATE INDEX "Bestellung_aboAbwicklungId_idx" ON "Bestellung"("aboAbwicklungId");
