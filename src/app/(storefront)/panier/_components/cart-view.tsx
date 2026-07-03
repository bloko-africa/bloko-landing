"use client";

import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import Link from "next/link";

export function CartView({ currency }: { currency: string }) {
  const { items, removeItem, setQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--breakpoint-md) px-4 py-20 text-center">
        <h1 className="text-heading-6 font-medium text-dark dark:text-white">
          Ton panier est vide
        </h1>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-6 font-medium text-dark dark:text-white">
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
                href={`/produits/${item.productSlug}`}
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

      <div className="mt-10 flex items-center justify-between border-t border-stroke pt-6 dark:border-dark-3">
        <span className="text-body-lg font-medium text-dark dark:text-white">
          Total : {formatPrice(totalPrice, currency)}
        </span>

        <Link
          href="/commande"
          className="rounded-full bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90"
        >
          Passer commande
        </Link>
      </div>
    </div>
  );
}
