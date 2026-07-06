-- CreateTable
CREATE TABLE "Charge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produktId" INTEGER NOT NULL,
    "mitarbeiterId" INTEGER NOT NULL,
    "herstellungsdatum" DATETIME NOT NULL,
    "mhd" DATETIME NOT NULL,
    "produzierteMenge" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Charge_produktId_fkey" FOREIGN KEY ("produktId") REFERENCES "Produkt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Charge_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Charge_produktId_idx" ON "Charge"("produktId");

-- CreateIndex
CREATE INDEX "Charge_mitarbeiterId_idx" ON "Charge"("mitarbeiterId");

-- CreateIndex
CREATE INDEX "Charge_mhd_idx" ON "Charge"("mhd");

-- CreateIndex
CREATE INDEX "Charge_status_idx" ON "Charge"("status");
