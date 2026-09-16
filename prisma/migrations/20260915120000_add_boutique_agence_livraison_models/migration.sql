-- Migration generee a la main (le CLI Prisma n'a pas ete execute contre la
-- base reelle dans cette session — voir consignes de la tache). Non appliquee.

-- CreateEnum
CREATE TYPE "BoutiqueStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LivraisonStatus" AS ENUM ('A_ASSIGNER', 'PRISE_EN_CHARGE', 'EN_ROUTE', 'LIVREE', 'ECHEC', 'RETOUR');

-- CreateTable
CREATE TABLE "boutique" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "BoutiqueStatus" NOT NULL DEFAULT 'PENDING',
    "owner_id" TEXT NOT NULL,
    "pays" TEXT NOT NULL DEFAULT 'Bénin',
    "ville" TEXT NOT NULL,
    "quartier" TEXT,
    "adresse" TEXT,
    "accent_color" TEXT NOT NULL DEFAULT '#a67c52',
    "hero_eyebrow" TEXT,
    "hero_title" TEXT,
    "hero_subtitle" TEXT,
    "hero_cta_label" TEXT,
    "bio" TEXT,
    "logo_url" TEXT,
    "cover_image" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "featured_collection_id" TEXT,
    "social_facebook" TEXT,
    "social_instagram" TEXT,
    "social_tiktok" TEXT,
    "social_whatsapp" TEXT,
    "legal_mentions" TEXT,
    "cgv_content" TEXT,
    "trust_badges" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "zones" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livraison" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "agence_id" TEXT,
    "status" "LivraisonStatus" NOT NULL DEFAULT 'A_ASSIGNER',
    "tracking_code" TEXT,
    "notes" TEXT,
    "proof_url" TEXT,
    "assigned_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livraison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boutique_handle_key" ON "boutique"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_owner_id_key" ON "boutique"("owner_id");

-- CreateIndex
CREATE INDEX "boutique_status_idx" ON "boutique"("status");

-- CreateIndex
CREATE INDEX "boutique_ville_idx" ON "boutique"("ville");

-- CreateIndex
CREATE UNIQUE INDEX "livraison_order_id_key" ON "livraison"("order_id");

-- CreateIndex
CREATE INDEX "livraison_status_idx" ON "livraison"("status");

-- CreateIndex
CREATE INDEX "livraison_agence_id_idx" ON "livraison"("agence_id");

-- AddForeignKey
ALTER TABLE "boutique" ADD CONSTRAINT "boutique_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique" ADD CONSTRAINT "boutique_featured_collection_id_fkey" FOREIGN KEY ("featured_collection_id") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livraison" ADD CONSTRAINT "livraison_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livraison" ADD CONSTRAINT "livraison_agence_id_fkey" FOREIGN KEY ("agence_id") REFERENCES "agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: rattachement boutique (nullable pour l'instant, voir backfill
-- puis la migration tighten_boutique_id_required)
ALTER TABLE "user" ADD COLUMN "boutique_id" TEXT;
CREATE INDEX "user_boutique_id_idx" ON "user"("boutique_id");
ALTER TABLE "user" ADD CONSTRAINT "user_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product" ADD COLUMN "boutique_id" TEXT;
CREATE INDEX "product_boutique_id_idx" ON "product"("boutique_id");

ALTER TABLE "collection" ADD COLUMN "boutique_id" TEXT;
CREATE INDEX "collection_boutique_id_idx" ON "collection"("boutique_id");

ALTER TABLE "order" ADD COLUMN "boutique_id" TEXT;
CREATE INDEX "order_boutique_id_idx" ON "order"("boutique_id");

-- Les FKs product/collection/order -> boutique (ON DELETE RESTRICT) sont
-- ajoutees dans la migration tighten_boutique_id_required, une fois la
-- colonne backfillee et rendue NOT NULL (une FK NOT VALID sur colonne
-- encore nullable n'apporte rien ici, la base est en pre-lancement).
