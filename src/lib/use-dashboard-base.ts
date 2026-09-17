"use client";

import { useSession } from "@/lib/auth/auth-client";
import { getDashboardBase } from "@/lib/dashboard-space";

/** Équivalent client de getDashboardBase(), lit le rôle depuis la session. */
export function useDashboardBase(): string {
  const session = useSession();
  return getDashboardBase((session.data?.user as { role?: string } | undefined)?.role);
}
