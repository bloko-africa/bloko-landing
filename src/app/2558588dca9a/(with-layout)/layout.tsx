import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { VendorBottomNav } from "@/components/Layouts/vendor-bottom-nav";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { type PropsWithChildren } from "react";

// Le header affichait "Mode Shop" en dur (résidu du template NextAdmin
// d'origine) pour TOUTE vendeuse, quelle que soit sa vraie boutique — le
// texte le plus visible du dashboard mentait à 100% des utilisatrices, et
// rien nulle part n'indiquait "quelle boutique je gère" (voir aussi
// UserInfo pour le rôle). Résolu ici en base pour ne pas dupliquer la
// requête dans Header, qui reste un composant client sans accès direct.
export default async function WithLayout({ children }: PropsWithChildren) {
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
        />

        <main className="iblokote mx-auto w-full max-w-(--breakpoint-2xl) overflow-hidden p-4 pb-20 md:p-6 md:pb-6 2xl:p-10">
          {children}
        </main>
      </div>

      <VendorBottomNav />
    </div>
  );
}
