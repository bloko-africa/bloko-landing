"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useBoutiqueHandle, useBoutiquePath } from "@/lib/boutique-path";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  unitPrice: number;
};

type ProductDetailProps = {
  currency: string;
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    basePrice: number;
    collectionName: string | null;
    images: { id: string; url: string }[];
    variants: Variant[];
  };
};

export function ProductDetail({ product, currency }: ProductDetailProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const handle = useBoutiqueHandle();
  const commandePath = useBoutiquePath("/commande");
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);

  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size).filter(Boolean))],
    [product.variants],
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color).filter(Boolean))],
    [product.variants],
  );

  const selectedVariant = useMemo(() => {
    if (product.variants.length === 1 && !sizes.length && !colors.length) {
      return product.variants[0];
    }
    return product.variants.find(
      (v) =>
        (sizes.length === 0 || v.size === size) &&
        (colors.length === 0 || v.color === color),
    );
  }, [product.variants, size, color, sizes.length, colors.length]);

  const displayPrice = selectedVariant?.unitPrice ?? product.basePrice;
  const needsSelection = (sizes.length > 0 && !size) || (colors.length > 0 && !color);

  function addSelectedToCart(): boolean {
    if (needsSelection || !selectedVariant) {
      toast.error("Choisis une taille/couleur avant de continuer.");
      return false;
    }
    if (selectedVariant.stock < 1) {
      toast.error("Cette variante est en rupture de stock.");
      return false;
    }

    addItem({
      boutiqueHandle: handle,
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: selectedVariant.unitPrice,
      image: product.images[0]?.url ?? null,
      stock: selectedVariant.stock,
    });
    return true;
  }

  function handleAddToCart() {
    if (addSelectedToCart()) toast.success("Ajouté au panier");
  }

  function handleBuyNow() {
    if (addSelectedToCart()) router.push(commandePath);
  }

  return (
    <div className="mx-auto grid max-w-(--breakpoint-2xl) grid-cols-1 gap-10 px-4 py-12 md:px-8 lg:grid-cols-2">
      <div>
        <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-gray-2 dark:bg-dark-2">
          {product.images[activeImage] && (
            <Image
              src={product.images[activeImage].url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          )}
        </div>

        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveImage(index)}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border-2",
                  index === activeImage ? "border-primary" : "border-transparent",
                )}
              >
                <Image src={image.url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.collectionName && (
          <p className="text-body-sm font-medium uppercase tracking-widest text-primary">
            {product.collectionName}
          </p>
        )}
        <h1 className="mt-2 text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
          {product.name}
        </h1>
        <p className="mt-3 text-heading-6 font-medium text-dark dark:text-white">
          {formatPrice(displayPrice, currency)}
        </p>

        {product.description && (
          <div
            className="rich-text mt-6 text-body-sm text-dark-5 dark:text-dark-6"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {sizes.length > 0 && (
          <div className="mt-8">
            <span className="text-body-sm font-medium text-dark dark:text-white">
              Taille
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-body-sm font-medium",
                    size === s
                      ? "border-primary bg-primary text-white"
                      : "border-stroke text-dark-5 hover:border-primary dark:border-dark-3 dark:text-dark-6",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-6">
            <span className="text-body-sm font-medium text-dark dark:text-white">
              Couleur
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-body-sm font-medium",
                    color === c
                      ? "border-primary bg-primary text-white"
                      : "border-stroke text-dark-5 hover:border-primary dark:border-dark-3 dark:text-dark-6",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
          <p className="mt-4 text-body-sm text-yellow-dark-2">
            Plus que {selectedVariant.stock} en stock
          </p>
        )}
        {selectedVariant && selectedVariant.stock === 0 && (
          <p className="mt-4 text-body-sm text-red">Rupture de stock</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAddToCart}
            className="w-full border border-dark py-3.5 font-medium uppercase tracking-wide text-dark hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-dark"
            disabled={selectedVariant?.stock === 0}
          >
            Ajouter au panier
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full bg-dark py-3.5 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-dark"
            disabled={selectedVariant?.stock === 0}
          >
            Acheter maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
