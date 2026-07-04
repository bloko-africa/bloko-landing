-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "accent_color" TEXT NOT NULL DEFAULT '#a67c52',
ADD COLUMN     "featured_collection_id" TEXT,
ADD COLUMN     "hero_eyebrow" TEXT NOT NULL DEFAULT 'Nouvelle collection',
ADD COLUMN     "store_name" TEXT NOT NULL DEFAULT 'Mode Shop';

-- AddForeignKey
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_featured_collection_id_fkey" FOREIGN KEY ("featured_collection_id") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
