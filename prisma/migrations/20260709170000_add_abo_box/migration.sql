-- CreateTable
CREATE TABLE "AboBox" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kundeId" INTEGER NOT NULL,
    "lieferadresse" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startdatum" DATETIME NOT NULL,
    "pausiertSeit" DATETIME,
    "kuendigungsdatum" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AboBox_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AboBox_kundeId_idx" ON "AboBox"("kundeId");

-- CreateIndex
CREATE INDEX "AboBox_status_idx" ON "AboBox"("status");

-- CreateIndex
CREATE INDEX "AboBox_startdatum_idx" ON "AboBox"("startdatum");

-- CreateIndex
CREATE INDEX "AboBox_pausiertSeit_idx" ON "AboBox"("pausiertSeit");

-- CreateIndex
CREATE INDEX "AboBox_kuendigungsdatum_idx" ON "AboBox"("kuendigungsdatum");
