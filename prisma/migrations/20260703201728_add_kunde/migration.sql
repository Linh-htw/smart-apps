-- CreateTable
CREATE TABLE "Kunde" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "typ" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firmenname" TEXT,
    "ustId" TEXT,
    "email" TEXT,
    "instagramHandle" TEXT,
    "adresse" TEXT,
    "zahlungsziel" INTEGER,
    "stammkunde" BOOLEAN NOT NULL DEFAULT false,
    "vorlieben" TEXT,
    "hauttyp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Kunde_typ_idx" ON "Kunde"("typ");

-- CreateIndex
CREATE INDEX "Kunde_stammkunde_idx" ON "Kunde"("stammkunde");
