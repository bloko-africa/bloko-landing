import { getBoutiqueByHandle } from "@/lib/boutique";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartView } from "./_components/cart-view";

export const metadata: Metadata = { title: "Mon panier" };
export const dynamic = "force-dynamic";

export default async function CartPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) notFound();

  return (
    <CartView
      currency={boutique.currency}
      deliveryFee={Number(boutique.deliveryFee)}
      deliveryFeeMode={boutique.deliveryFeeMode}
    />
  );
}
