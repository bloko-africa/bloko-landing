import { CookieConsent } from "@/components/Storefront/cookie-consent";
import { PlatformHeader } from "@/components/Storefront/platform-header";
import { PlatformFooter } from "@/components/Storefront/platform-footer";
import type { PropsWithChildren } from "react";

// Accueil plateforme Bloko (recherche + découverte cross-boutiques) : pas de
// CartProvider ici, aucun panier n'existe tant qu'on n'est pas entré dans
// une boutique via /b/[handle] (voir ce layout séparé).
export default function PlatformLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-1 dark:bg-gray-dark">
      <PlatformHeader />
      <main className="flex-1">{children}</main>
      <PlatformFooter />
      <CookieConsent />
    </div>
  );
}
