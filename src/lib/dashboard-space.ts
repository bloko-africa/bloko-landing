import type { AppRole } from "@/lib/auth/modules/authorization/permissions";

// Importé aussi bien par des composants client (Sidebar, Breadcrumb...) que
// serveur — ne rien mettre ici qui dépende d'une API server-only comme
// next/cache (voir dashboard-space-server.ts pour revalidateDashboardPath).
export const ADMIN_BASE = "/2558588dca9a";
export const VENDOR_BASE = "/ma-boutique";

/**
 * Point de vérité unique pour le préfixe d'URL du dashboard selon le rôle —
 * staff plateforme (viewer/editor/admin) et vendeuse (vendeur) ont chacun
 * leur espace depuis la séparation des deux dashboards. Utilisé partout où
 * un lien/redirect/revalidatePath référence le dashboard, pour qu'une
 * vendeuse ne se retrouve jamais renvoyée vers l'espace admin par un lien
 * codé en dur.
 */
export function getDashboardBase(role: AppRole | string | undefined | null): string {
  return role === "vendeur" ? VENDOR_BASE : ADMIN_BASE;
}
