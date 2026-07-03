import { db } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Boutique" };
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; category?: string }>;
}) {
  const { collection: collectionSlug, category: categorySlug } =
    await searchParams;

  const [collections, categories, products] = await Promise.all([
    db.collection.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: {
        status: "PUBLISHED",
        collection: collectionSlug ? { slug: collectionSlug } : undefined,
        category: categorySlug ? { slug: categorySlug } : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-12 md:px-8">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
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
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/produits/${product.slug}`} className="group">
              <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-gray-2 dark:bg-dark-2">
                {product.images[0] && (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                )}
              </div>
              <p className="mt-3 text-body-sm font-medium text-dark dark:text-white">
                {product.name}
              </p>
              <p className="text-body-sm text-dark-5 dark:text-dark-6">
                {Number(product.basePrice).toLocaleString("fr-FR")} XOF
              </p>
            </Link>
          ))}
        </div>
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
