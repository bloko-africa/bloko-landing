"use client";

import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type ProductCardVariant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  unitPrice: number;
};

type ProductCardProps = {
  slug: string;
  name: string;
  image: string | null;
  basePrice: number;
  currency: string;
  variants: ProductCardVariant[];
};

export function ProductCard({
  slug,
  name,
  image,
  basePrice,
  currency,
  variants,
}: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const singleVariant = variants.length === 1 ? variants[0] : null;
  const canQuickAct = Boolean(singleVariant && singleVariant.stock > 0);
  const displayPrice = singleVariant?.unitPrice ?? basePrice;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!canQuickAct || !singleVariant) {
      router.push(`/produits/${slug}`);
      return;
    }
    addItem({
      variantId: singleVariant.id,
      productSlug: slug,
      productName: name,
      size: singleVariant.size,
      color: singleVariant.color,
      unitPrice: singleVariant.unitPrice,
      image,
      stock: singleVariant.stock,
    });
    toast.success("Ajouté au panier");
  }

  function handleQuickBuy(e: React.MouseEvent) {
    e.preventDefault();
    if (!canQuickAct || !singleVariant) {
      router.push(`/produits/${slug}`);
      return;
    }
    addItem({
      variantId: singleVariant.id,
      productSlug: slug,
      productName: name,
      size: singleVariant.size,
      color: singleVariant.color,
      unitPrice: singleVariant.unitPrice,
      image,
      stock: singleVariant.stock,
    });
    router.push("/commande");
  }

  return (
    <div className="group relative">
      <Link href={`/produits/${slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-gray-2 dark:bg-dark-2">
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          )}

          {/* Desktop : boutons revele au survol */}
          <div className="absolute inset-x-2 bottom-2 hidden gap-2 opacity-0 transition group-hover:opacity-100 sm:flex">
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-white/95 py-2 text-body-xs font-medium uppercase tracking-wide text-dark hover:bg-white"
            >
              Ajouter
            </button>
            <button
              onClick={handleQuickBuy}
              className="flex-1 bg-dark py-2 text-body-xs font-medium uppercase tracking-wide text-white hover:bg-opacity-90"
            >
              Acheter
            </button>
          </div>

          {/* Mobile : icones compactes toujours visibles */}
          <div className="absolute right-2 bottom-2 flex gap-1.5 sm:hidden">
            <button
              onClick={handleQuickAdd}
              aria-label="Ajouter au panier"
              className="flex size-8 items-center justify-center rounded-full bg-white/95 shadow-1"
            >
              <CartIcon />
            </button>
            <button
              onClick={handleQuickBuy}
              aria-label="Acheter maintenant"
              className="flex size-8 items-center justify-center rounded-full bg-dark shadow-1"
            >
              <BoltIcon />
            </button>
          </div>
        </div>

        <p className="mt-3 text-body-sm font-medium uppercase tracking-wide text-dark dark:text-white">
          {name}
        </p>
        <p className="text-body-sm text-dark-5 dark:text-dark-6">
          {formatPrice(displayPrice, currency)}
        </p>
      </Link>
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dark">
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="19" cy="21" r="1.4" />
      <path d="M1 1h3.2l2.6 13.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L22.4 6H5" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
