-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "hero_title" TEXT NOT NULL DEFAULT 'Le prêt-à-porter, pensé pour vous',
    "hero_subtitle" TEXT NOT NULL DEFAULT 'Des pièces sélectionnées, livrées depuis Cotonou et Abidjan.',
    "hero_cta_label" TEXT NOT NULL DEFAULT 'Découvrir la boutique',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
