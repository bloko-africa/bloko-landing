import { CookieConsent } from "@/components/Storefront/cookie-consent";
import { StorefrontFooter } from "@/components/Storefront/footer";
import { StorefrontHeader } from "@/components/Storefront/header";
import { CartProvider } from "@/lib/cart/cart-context";
import { getStoreSettings } from "@/lib/store-settings";
import type { PropsWithChildren } from "react";

export default async function StorefrontLayout({ children }: PropsWithChildren) {
  const settings = await getStoreSettings();

  return (
    <CartProvider>
      <style>{`:root{--color-primary: ${settings.accentColor};}`}</style>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-dark">
        <StorefrontHeader storeName={settings.storeName} />
        <main className="flex-1">{children}</main>
        <StorefrontFooter
          storeName={settings.storeName}
          social={{
            facebook: settings.socialFacebook,
            instagram: settings.socialInstagram,
            tiktok: settings.socialTiktok,
            whatsapp: settings.socialWhatsapp,
          }}
        />
      </div>
      <CookieConsent />
    </CartProvider>
  );
}
