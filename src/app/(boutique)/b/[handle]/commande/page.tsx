import { getBoutiqueByHandle } from "@/lib/boutique";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "./_components/checkout-form";

export const metadata: Metadata = { title: "Finaliser la commande" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) notFound();

  return (
    <CheckoutForm
      currency={boutique.currency}
      boutiqueHandle={boutique.handle}
      deliveryFee={Number(boutique.deliveryFee)}
      deliveryFeeMode={boutique.deliveryFeeMode}
    />
  );
}
