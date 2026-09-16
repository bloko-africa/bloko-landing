import "server-only";
import { db } from "@/lib/db";

/**
 * Résout une boutique publique par son handle — utilisé par le layout
 * `/b/[handle]` et par chaque page de ce sous-arbre pour scoper ses
 * requêtes. Retourne `null` si absente OU pas encore ACTIVE (le caller
 * appelle notFound()) : une boutique PENDING/SUSPENDED n'est jamais
 * accessible publiquement, seulement depuis l'admin.
 */
export async function getBoutiqueByHandle(handle: string) {
  return db.boutique.findFirst({
    where: { handle, status: "ACTIVE" },
    include: {
      featuredCollection: {
        select: { id: true, name: true, slug: true, coverImage: true },
      },
    },
  });
}

export type PublicBoutique = NonNullable<
  Awaited<ReturnType<typeof getBoutiqueByHandle>>
>;
