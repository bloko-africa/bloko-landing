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
