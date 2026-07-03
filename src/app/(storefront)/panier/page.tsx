import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";
import { CartView } from "./_components/cart-view";

export const metadata: Metadata = { title: "Mon panier" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getStoreSettings();
  return <CartView currency={settings.currency} />;
}
