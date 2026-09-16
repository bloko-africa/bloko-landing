-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('EN_COURS', 'TERMINE');

-- CreateTable
CREATE TABLE "live_session" (
    "id" TEXT NOT NULL,
    "boutique_id" TEXT NOT NULL,
    "started_by_id" TEXT NOT NULL,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'EN_COURS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_session_product" (
    "id" TEXT NOT NULL,
    "live_session_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "live_session_product_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "order" ADD COLUMN "live_session_id" TEXT;

-- CreateIndex
CREATE INDEX "live_session_boutique_id_status_idx" ON "live_session"("boutique_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "live_session_product_live_session_id_product_id_key" ON "live_session_product"("live_session_id", "product_id");

-- CreateIndex
CREATE INDEX "live_session_product_live_session_id_idx" ON "live_session_product"("live_session_id");

-- CreateIndex
CREATE INDEX "order_live_session_id_idx" ON "order"("live_session_id");

-- AddForeignKey
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_started_by_id_fkey" FOREIGN KEY ("started_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_product" ADD CONSTRAINT "live_session_product_live_session_id_fkey" FOREIGN KEY ("live_session_id") REFERENCES "live_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_product" ADD CONSTRAINT "live_session_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_live_session_id_fkey" FOREIGN KEY ("live_session_id") REFERENCES "live_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
