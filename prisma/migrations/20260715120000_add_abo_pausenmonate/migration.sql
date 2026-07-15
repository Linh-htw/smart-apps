-- AlterTable
ALTER TABLE "AboBox" ADD COLUMN "pausiertVon" DATETIME;
ALTER TABLE "AboBox" ADD COLUMN "pausiertBis" DATETIME;

-- CreateIndex
CREATE INDEX "AboBox_pausiertVon_idx" ON "AboBox"("pausiertVon");

-- CreateIndex
CREATE INDEX "AboBox_pausiertBis_idx" ON "AboBox"("pausiertBis");
