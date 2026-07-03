-- CreateTable
CREATE TABLE "Produkt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "vegan" BOOLEAN NOT NULL DEFAULT false,
    "inhaltsstoffe" TEXT,
    "allergene" TEXT,
    "preisB2c" DECIMAL NOT NULL,
    "preisB2b" DECIMAL NOT NULL,
    "b2cPuffermenge" DECIMAL NOT NULL,
    "standardMhdDauerMonate" INTEGER NOT NULL,
    "inAboBoxEnthalten" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Produkt_kategorie_idx" ON "Produkt"("kategorie");

-- CreateIndex
CREATE INDEX "Produkt_vegan_idx" ON "Produkt"("vegan");

-- CreateIndex
CREATE INDEX "Produkt_inAboBoxEnthalten_idx" ON "Produkt"("inAboBoxEnthalten");
