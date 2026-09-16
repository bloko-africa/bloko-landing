import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { AppRole } from "./modules/authorization/permissions";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * A utiliser en tête de chaque Server Action de mutation catalogue/commande.
 * Lève une erreur si non-connecté ou role insuffisant (l'action s'arrête,
 * le client affiche l'erreur via toast).
 */
export async function requireRole(allowed: AppRole[]) {
  const session = await getCurrentSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !role || !allowed.includes(role as AppRole)) {
    throw new Error("Action non autorisée pour ce rôle.");
  }

  return session;
}

/**
 * Variante de requireRole() pour tout ce qui touche une ressource rattachée
 * à une boutique (produits, collections, commandes, livraisons...).
 *
 * - Staff plateforme (viewer/editor/admin) : scopedBoutiqueId vaut
 *   `undefined` — non filtré, voit/agit sur toutes les boutiques.
 * - Vendeuse (role "vendeur") : scopedBoutiqueId vaut sa propre boutique.
 *   Utilisée seule (sans targetBoutiqueId) sur une liste, elle sert de
 *   valeur de filtre Prisma (`where: { boutiqueId: scopedBoutiqueId }`).
 *   Avec targetBoutiqueId (page détail / mutation sur une ressource déjà
 *   chargée), elle lève une erreur si la ressource appartient à une autre
 *   boutique — protège un accès direct par URL.
 */
export async function requireBoutiqueAccess(
  allowed: AppRole[],
  targetBoutiqueId?: string,
) {
  const session = await requireRole(allowed);
  const role = (session.user as { role?: string }).role as AppRole;
  const userBoutiqueId =
    (session.user as { boutiqueId?: string | null }).boutiqueId ?? null;

  if (role !== "vendeur") {
    return { session, scopedBoutiqueId: undefined as string | undefined };
  }

  if (!userBoutiqueId) {
    throw new Error("Ce compte vendeur n'est rattaché à aucune boutique.");
  }

  if (targetBoutiqueId && targetBoutiqueId !== userBoutiqueId) {
    throw new Error("Action non autorisée pour cette boutique.");
  }

  return { session, scopedBoutiqueId: userBoutiqueId as string | undefined };
}
