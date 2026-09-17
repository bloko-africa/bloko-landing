import { DiscoveryProductCard } from "@/components/Storefront/discovery-product-card";
import { BlokoSearchBar } from "@/components/Storefront/bloko-search-bar";
import { db } from "@/lib/db";
import { getBuyerPrice } from "@/lib/pricing";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Découvrir" };
export const dynamic = "force-dynamic";

export default async function DecouvrirPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category: categorySlug, q } = await searchParams;

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: {
        status: "PUBLISHED",
        boutique: { status: "ACTIVE" },
        category: categorySlug ? { slug: categorySlug } : undefined,
        name: q ? { contains: q, mode: "insensitive" } : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 48,
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        variants: { select: { priceOverride: true } },
        boutique: { select: { handle: true, currency: true, passCommissionToClient: true } },
      },
    }),
  ]);

  function categoryHref(slug: string | null) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (q) params.set("q", q);
    const query = params.toString();
    return query ? `/decouvrir?${query}` : "/decouvrir";
  }

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-lg">
        <BlokoSearchBar />
      </div>

      <div className="scrollbar-hide -mx-4 mt-5 flex snap-x gap-2 overflow-x-auto px-4 sm:mx-0 sm:mt-8 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        <Link
          href={categoryHref(null)}
          className={
            !categorySlug
              ? "shrink-0 snap-start rounded-full bg-primary px-4 py-1.5 text-body-sm font-medium whitespace-nowrap text-white"
              : "shrink-0 snap-start rounded-full border border-stroke px-4 py-1.5 text-body-sm font-medium whitespace-nowrap text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
          }
        >
          Tout
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={categoryHref(c.slug)}
            className={
              categorySlug === c.slug
                ? "shrink-0 snap-start rounded-full bg-primary px-4 py-1.5 text-body-sm font-medium whitespace-nowrap text-white"
                : "shrink-0 snap-start rounded-full border border-stroke px-4 py-1.5 text-body-sm font-medium whitespace-nowrap text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
            }
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-body-sm text-dark-5 dark:text-dark-6">
          Aucun produit ne correspond pour le moment.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <DiscoveryProductCard
              key={p.id}
              href={`/b/${p.boutique.handle}/produits/${p.slug}`}
              image={p.images[0]?.url ?? null}
              name={p.name}
              price={getBuyerPrice(
                Number(p.variants[0]?.priceOverride ?? p.basePrice),
                p.boutique.passCommissionToClient,
              )}
              currency={p.boutique.currency}
              boutiqueHandle={p.boutique.handle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
