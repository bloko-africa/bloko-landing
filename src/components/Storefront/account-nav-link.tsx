"use client";

import { useSession } from "@/lib/auth/auth-client";
import Link from "next/link";

// Isolé du header (server component statique) pour ne pas forcer tout
// l'accueil plateforme en rendu dynamique juste pour lire la session — un
// aller-retour client au montage, comme StorefrontHeader le fait déjà pour
// le panier/compte côté boutique.
export function AccountNavLink({ className }: { className?: string }) {
  const session = useSession();
  const href = session.data?.session ? "/compte" : "/connexion";
  const label = session.data?.session ? "Mon compte" : "Connexion";

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
