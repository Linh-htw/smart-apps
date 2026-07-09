-- AlterTable
ALTER TABLE "Bestellung" ADD COLUMN "allergeneBestaetigtAm" DATETIME;

-- CreateIndex
CREATE INDEX "Bestellung_allergeneBestaetigtAm_idx" ON "Bestellung"("allergeneBestaetigtAm");
