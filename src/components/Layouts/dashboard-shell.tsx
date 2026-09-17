import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { VendorBottomNav } from "@/components/Layouts/vendor-bottom-nav";
import { getCurrentSession } from "@/lib/auth/session";
import { getDashboardBase } from "@/lib/dashboard-space";
import { db } from "@/lib/db";
import { type PropsWithChildren } from "react";

// Coquille commune aux deux espaces (/2558588dca9a staff, /ma-boutique
// vendeuse) — même Sidebar (qui filtre déjà ses items par rôle), même
// Header contextualisé, même VendorBottomNav (qui ne se rend que pour une
// vendeuse). Un seul fichier pour ne pas dupliquer cette logique entre les
// deux layout.tsx qui le ré-exportent chacun tel quel.
export async function DashboardShell({ children }: PropsWithChildren) {
  const session = await getCurrentSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const boutiqueId = (session?.user as { boutiqueId?: string | null } | undefined)?.boutiqueId;

  const boutique =
    role === "vendeur" && boutiqueId
      ? await db.boutique.findUnique({
          where: { id: boutiqueId },
          select: { displayName: true, handle: true },
        })
      : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#0d0c0a]">
        <Header
          subtitle={boutique?.displayName ?? "Plateforme"}
          storeUrl={boutique ? `/b/${boutique.handle}` : null}
          dashboardBase={getDashboardBase(role)}
        />

        <main className="iblokote mx-auto w-full max-w-(--breakpoint-2xl) overflow-hidden p-4 pb-20 md:p-6 md:pb-6 2xl:p-10">
          {children}
        </main>
      </div>

      <VendorBottomNav />
    </div>
  );
}
