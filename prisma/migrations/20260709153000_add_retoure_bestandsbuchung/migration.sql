-- AlterTable
ALTER TABLE "Retoure" ADD COLUMN "bestandsbuchung" TEXT;
ALTER TABLE "Retoure" ADD COLUMN "bestandsbuchungAm" DATETIME;

-- CreateIndex
CREATE INDEX "Retoure_bestandsbuchung_idx" ON "Retoure"("bestandsbuchung");

-- CreateIndex
CREATE INDEX "Retoure_bestandsbuchungAm_idx" ON "Retoure"("bestandsbuchungAm");
