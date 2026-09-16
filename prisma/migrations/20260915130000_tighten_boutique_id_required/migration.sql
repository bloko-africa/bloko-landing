-- Migration generee a la main, non appliquee (voir consignes de la tache).
-- A executer seulement APRES le backfill (prisma/seed-default-boutique.ts) :
-- toute ligne product/collection/order avec boutique_id encore NULL fera
-- echouer le SET NOT NULL.

ALTER TABLE "product" ALTER COLUMN "boutique_id" SET NOT NULL;
ALTER TABLE "collection" ALTER COLUMN "boutique_id" SET NOT NULL;
ALTER TABLE "order" ALTER COLUMN "boutique_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
