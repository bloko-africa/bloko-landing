import "server-only";
import { db } from "@/lib/db";

export type RatingSummary = { average: number; count: number };

export async function getBoutiqueRating(boutiqueId: string): Promise<RatingSummary> {
  const agg = await db.review.aggregate({
    where: { boutiqueId },
    _avg: { rating: true },
    _count: true,
  });
  return { average: agg._avg.rating ?? 0, count: agg._count };
}

/**
 * Score utilisé pour trier les boutiques "en vedette" — moyenne pondérée
 * façon IMDb (Bayesian average) plutôt qu'une moyenne brute : une boutique
 * avec un seul avis 5 étoiles ne doit pas dépasser une boutique avec 20
 * avis à 4,5 — le nombre d'avis compte autant que la note elle-même.
 * PLATFORM_AVG/PLATFORM_WEIGHT sont des constantes raisonnables tant que la
 * plateforme est jeune (peu d'avis au total) ; à revoir si le volume monte.
 */
const PLATFORM_AVG = 4;
const PLATFORM_WEIGHT = 3;

export function featuredScore({ average, count }: RatingSummary): number {
  return (PLATFORM_WEIGHT * PLATFORM_AVG + count * average) / (PLATFORM_WEIGHT + count);
}
