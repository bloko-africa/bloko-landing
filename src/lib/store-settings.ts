import "server-only";
import { db } from "@/lib/db";
import { type SupportedCurrency } from "@/lib/currencies";

const DEFAULTS = {
  storeName: "Mode Shop",
  currency: "XOF" as SupportedCurrency,
  accentColor: "#a67c52",
  heroEyebrow: "Nouvelle collection",
  heroTitle: "Le prêt-à-porter, pensé pour vous",
  heroSubtitle: "Des pièces sélectionnées, livrées depuis Cotonou et Abidjan.",
  heroCtaLabel: "Découvrir la boutique",
  featuredCollectionId: null as string | null,
  featuredCollection: null as {
    id: string;
    name: string;
    slug: string;
    coverImage: string | null;
  } | null,
};

/**
 * Singleton en lecture seule — pas d'ecriture ici (evite un upsert a chaque
 * rendu de page). La ligne n'est creee que via updateStoreSettings (action
 * admin). Tant qu'elle n'existe pas, on retourne les valeurs par defaut.
 */
export async function getStoreSettings() {
  const settings = await db.storeSettings.findUnique({
    where: { id: "default" },
    include: {
      featuredCollection: {
        select: { id: true, name: true, slug: true, coverImage: true },
      },
    },
  });

  return settings ?? DEFAULTS;
}
