import { CookieConsent } from "@/components/Storefront/cookie-consent";
import { StorefrontFooter } from "@/components/Storefront/footer";
import { StorefrontHeader } from "@/components/Storefront/header";
import { CartProvider } from "@/lib/cart/cart-context";
import { getBoutiqueByHandle } from "@/lib/boutique";
import type { PropsWithChildren } from "react";
import { notFound } from "next/navigation";

export default async function BoutiqueLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ handle: string }> }>) {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);

  if (!boutique) notFound();

  return (
    <CartProvider>
      <style>{`:root{--color-primary: ${boutique.accentColor};}`}</style>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-dark">
        <StorefrontHeader storeName={boutique.displayName} handle={boutique.handle} />
        <main className="flex-1">{children}</main>
        <StorefrontFooter
          storeName={boutique.displayName}
          handle={boutique.handle}
          social={{
            facebook: boutique.socialFacebook ?? "",
            instagram: boutique.socialInstagram ?? "",
            tiktok: boutique.socialTiktok ?? "",
            whatsapp: boutique.socialWhatsapp ?? "",
          }}
        />
      </div>
      <CookieConsent mentionsHref={`/b/${boutique.handle}/mentions-legales`} />
    </CartProvider>
  );
}
