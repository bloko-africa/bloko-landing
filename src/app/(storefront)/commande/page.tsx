import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";
import { CheckoutForm } from "./_components/checkout-form";

export const metadata: Metadata = { title: "Finaliser la commande" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return <CheckoutForm currency={settings.currency} />;
}
