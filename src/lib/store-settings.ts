import "server-only";
import { db } from "@/lib/db";
import { type SupportedCurrency } from "@/lib/currencies";

const DEFAULTS = {
  currency: "XOF" as SupportedCurrency,
  heroTitle: "Le prêt-à-porter, pensé pour vous",
  heroSubtitle: "Des pièces sélectionnées, livrées depuis Cotonou et Abidjan.",
  heroCtaLabel: "Découvrir la boutique",
};

/**
 * Singleton en lecture seule — pas d'ecriture ici (evite un upsert a chaque
 * rendu de page). La ligne n'est creee que via updateStoreSettings (action
 * admin). Tant qu'elle n'existe pas, on retourne les valeurs par defaut.
 */
export async function getStoreSettings() {
  const settings = await db.storeSettings.findUnique({
    where: { id: "default" },
  });

  return settings ?? DEFAULTS;
}
