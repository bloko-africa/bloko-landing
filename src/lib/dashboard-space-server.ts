import "server-only";
import { revalidatePath } from "next/cache";
import { ADMIN_BASE, VENDOR_BASE } from "@/lib/dashboard-space";

/**
 * Revalide un chemin de dashboard sous les DEUX préfixes — la plupart des
 * routes (produits, commandes, etc.) sont partagées (même page.tsx
 * ré-exportée sous les deux espaces, voir /ma-boutique), donc une mutation
 * par n'importe quel rôle doit invalider le cache des deux. `path` inclut
 * le `/` initial du segment après le préfixe (ex: "/products/abc").
 */
export function revalidateDashboardPath(path: string) {
  revalidatePath(`${ADMIN_BASE}${path}`);
  revalidatePath(`${VENDOR_BASE}${path}`);
}
