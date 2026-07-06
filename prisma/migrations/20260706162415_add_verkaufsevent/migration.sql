-- CreateTable
CREATE TABLE "Verkaufsevent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datum" DATETIME NOT NULL,
    "ort" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VerkaufseventPosition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "verkaufseventId" INTEGER NOT NULL,
    "chargeId" INTEGER NOT NULL,
    "mengeMitgenommen" INTEGER NOT NULL,
    "mengeVerkauft" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VerkaufseventPosition_verkaufseventId_fkey" FOREIGN KEY ("verkaufseventId") REFERENCES "Verkaufsevent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VerkaufseventPosition_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Verkaufsevent_datum_idx" ON "Verkaufsevent"("datum");

-- CreateIndex
CREATE INDEX "VerkaufseventPosition_verkaufseventId_idx" ON "VerkaufseventPosition"("verkaufseventId");

-- CreateIndex
CREATE INDEX "VerkaufseventPosition_chargeId_idx" ON "VerkaufseventPosition"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "VerkaufseventPosition_verkaufseventId_chargeId_key" ON "VerkaufseventPosition"("verkaufseventId", "chargeId");
