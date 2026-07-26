-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Bestellung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kundeId" INTEGER NOT NULL,
    "datum" DATETIME NOT NULL,
    "kanal" TEXT NOT NULL,
    "lieferadresse" TEXT,
    "allergeneBestaetigt" BOOLEAN NOT NULL DEFAULT false,
    "zahlungsstatus" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aboAbwicklungId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bestellung_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellung_aboAbwicklungId_fkey" FOREIGN KEY ("aboAbwicklungId") REFERENCES "AboAbwicklung" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Bestellung" (
    "id",
    "kundeId",
    "datum",
    "kanal",
    "lieferadresse",
    "allergeneBestaetigt",
    "zahlungsstatus",
    "status",
    "aboAbwicklungId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "kundeId",
    "datum",
    "kanal",
    "lieferadresse",
    CASE WHEN "allergeneBestaetigtAm" IS NULL THEN false ELSE true END,
    "zahlungsstatus",
    "status",
    "aboAbwicklungId",
    "createdAt",
    "updatedAt"
FROM "Bestellung";

DROP TABLE "Bestellung";
ALTER TABLE "new_Bestellung" RENAME TO "Bestellung";

CREATE INDEX "Bestellung_kundeId_idx" ON "Bestellung"("kundeId");
CREATE INDEX "Bestellung_aboAbwicklungId_idx" ON "Bestellung"("aboAbwicklungId");
CREATE INDEX "Bestellung_kanal_idx" ON "Bestellung"("kanal");
CREATE INDEX "Bestellung_zahlungsstatus_idx" ON "Bestellung"("zahlungsstatus");
CREATE INDEX "Bestellung_status_idx" ON "Bestellung"("status");
CREATE INDEX "Bestellung_datum_idx" ON "Bestellung"("datum");
CREATE INDEX "Bestellung_allergeneBestaetigt_idx" ON "Bestellung"("allergeneBestaetigt");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
