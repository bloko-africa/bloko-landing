"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useBoutiquePath } from "@/lib/boutique-path";
import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import Link from "next/link";

export function CartView({
  currency,
  deliveryFee,
  deliveryFeeMode,
}: {
  currency: string;
  deliveryFee: number;
  deliveryFeeMode: string;
}) {
  const { items, removeItem, setQuantity, totalPrice } = useCart();
  const produitsPath = useBoutiquePath("/produits");
  const commandePath = useBoutiquePath("/commande");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--breakpoint-md) px-4 py-20 text-center">
        <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
          Ton panier est vide
        </h1>
        <Link
          href={produitsPath}
          className="mt-6 inline-block bg-dark px-8 py-3 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
        Mon panier
      </h1>

      <div className="mt-8 space-y-5">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-gray-2 dark:bg-dark-2">
              {item.image && (
                <Image src={item.image} alt="" fill className="object-cover" sizes="80px" />
              )}
            </div>

            <div className="flex-1">
              <Link
                href={`${produitsPath}/${item.productSlug}`}
                className="font-medium text-dark hover:text-primary dark:text-white"
              >
                {item.productName}
              </Link>
              <p className="text-body-sm text-dark-5 dark:text-dark-6">
                {[item.size, item.color].filter(Boolean).join(" / ") || "—"}
              </p>
              <p className="text-body-sm text-dark-5 dark:text-dark-6">
                {formatPrice(item.unitPrice, currency)}
              </p>
            </div>

            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) => setQuantity(item.variantId, Number(e.target.value))}
              className="w-16 rounded border border-stroke bg-transparent px-2 py-1.5 text-center outline-none focus:border-primary dark:border-dark-3"
            />

            <button
              onClick={() => removeItem(item.variantId)}
              className="text-body-sm text-red hover:underline"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-stroke pt-6 dark:border-dark-3">
        {deliveryFeeMode === "INCLUS" && deliveryFee > 0 && (
          <div className="mb-2 flex items-center justify-between text-body-sm text-dark-5 dark:text-dark-6">
            <span>Livraison</span>
            <span>{formatPrice(deliveryFee, currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-body-lg font-medium text-dark dark:text-white">
            Total :{" "}
            {formatPrice(
              totalPrice + (deliveryFeeMode === "INCLUS" ? deliveryFee : 0),
              currency,
            )}
          </span>

          <Link
            href={commandePath}
            className="bg-dark px-8 py-3 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
          >
            Passer commande
          </Link>
        </div>
        {deliveryFeeMode === "A_LA_CHARGE_DU_CLIENT" && (
          <p className="mt-2 text-body-xs text-dark-5 dark:text-dark-6">
            {deliveryFee > 0
              ? `+ ${formatPrice(deliveryFee, currency)} de livraison, à payer à la réception`
              : "Livraison à régler directement avec le livreur"}
          </p>
        )}
      </div>
    </div>
  );
}
