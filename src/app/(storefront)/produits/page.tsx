import { ProductCard } from "@/components/Storefront/product-card";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Boutique" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; category?: string; page?: string }>;
}) {
  const {
    collection: collectionSlug,
    category: categorySlug,
    page: pageParam,
  } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);

  const where = {
    status: "PUBLISHED" as const,
    collection: collectionSlug ? { slug: collectionSlug } : undefined,
    category: categorySlug ? { slug: categorySlug } : undefined,
  };

  const [settings, collections, categories, totalCount, products] =
    await Promise.all([
      getStoreSettings(),
      db.collection.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      db.category.findMany({ orderBy: { name: "asc" } }),
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: {
            select: { id: true, size: true, color: true, stock: true, priceOverride: true },
          },
        },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (collectionSlug) params.set("collection", collectionSlug);
    if (categorySlug) params.set("category", categorySlug);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/produits?${query}` : "/produits";
  }

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-12 md:px-8">
      <h1 className="text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
        Boutique
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip
          label="Tout"
          active={!collectionSlug && !categorySlug}
          href="/produits"
        />
        {collections.map((collection) => (
          <FilterChip
            key={collection.id}
            label={collection.name}
            active={collectionSlug === collection.slug}
            href={`/produits?collection=${collection.slug}`}
          />
        ))}
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            active={categorySlug === category.slug}
            href={`/produits?category=${category.slug}`}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-body-sm text-dark-5 dark:text-dark-6">
          Aucun produit ne correspond à ce filtre pour le moment.
        </p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                image={product.images[0]?.url ?? null}
                basePrice={Number(product.basePrice)}
                currency={settings.currency}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  size: v.size,
                  color: v.color,
                  stock: v.stock,
                  unitPrice: Number(v.priceOverride ?? product.basePrice),
                }))}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              <Link
                href={pageHref(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 opacity-40 dark:border-dark-3 dark:text-dark-6"
                    : "rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
                }
              >
                Précédent
              </Link>

              <span className="text-body-sm text-dark-5 dark:text-dark-6">
                Page {page} / {totalPages}
              </span>

              <Link
                href={pageHref(Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 opacity-40 dark:border-dark-3 dark:text-dark-6"
                    : "rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
                }
              >
                Suivant
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-4 py-1.5 text-body-sm font-medium text-white"
          : "rounded-full border border-stroke px-4 py-1.5 text-body-sm font-medium text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
      }
    >
      {label}
    </Link>
  );
}
