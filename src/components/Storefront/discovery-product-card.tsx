import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import Link from "next/link";

// Carte produit pour la grille cross-boutiques (/decouvrir) — distincte de
// ProductCard (boutique-scopé, quick add/buy) : ici pas d'ajout rapide au
// panier puisqu'on n'est dans le contexte d'aucune boutique/CartProvider
// tant qu'on n'a pas cliqué vers /b/[handle]/produits/[slug].
export function DiscoveryProductCard({
  href,
  image,
  name,
  price,
  currency,
  boutiqueHandle,
}: {
  href: string;
  image: string | null;
  name: string;
  price: number;
  currency: string;
  boutiqueHandle: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-2 dark:bg-dark-2">
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-body-xs font-medium text-dark dark:bg-dark/80 dark:text-white">
          @{boutiqueHandle}
        </span>
      </div>
      <p className="mt-2 text-body-sm font-medium text-dark dark:text-white">{name}</p>
      <p className="text-body-sm font-semibold text-primary">{formatPrice(price, currency)}</p>
    </Link>
  );
}
