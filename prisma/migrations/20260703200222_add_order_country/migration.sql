-- AlterTable
ALTER TABLE "order" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'CI';

-- CreateIndex
CREATE INDEX "order_country_idx" ON "order"("country");
