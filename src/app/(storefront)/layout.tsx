import { StorefrontFooter } from "@/components/Storefront/footer";
import { StorefrontHeader } from "@/components/Storefront/header";
import { CartProvider } from "@/lib/cart/cart-context";
import type { PropsWithChildren } from "react";

export default function StorefrontLayout({ children }: PropsWithChildren) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-dark">
        <StorefrontHeader />
        <main className="flex-1">{children}</main>
        <StorefrontFooter />
      </div>
    </CartProvider>
  );
}
