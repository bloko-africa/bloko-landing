import { formatPrice } from "@/lib/format-price";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StorefrontHome() {
  const [settings, collections, products] = await Promise.all([
    getStoreSettings(),
    db.collection.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <div>
      <section className="border-b border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-20 text-center md:px-8 md:py-28">
          <p className="text-body-sm font-medium uppercase tracking-widest text-primary">
            Nouvelle collection
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-heading-3 font-medium text-dark dark:text-white md:text-heading-1">
            {settings.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-body-sm text-dark-5 dark:text-dark-6">
            {settings.heroSubtitle}
          </p>
          <Link
            href="/produits"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90"
          >
            {settings.heroCtaLabel}
          </Link>
        </div>
      </section>

      {collections.length > 0 && (
        <section className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8">
          <h2 className="text-heading-5 font-medium text-dark dark:text-white">
            Collections
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/produits?collection=${collection.slug}`}
                className="group relative flex aspect-3/4 items-end overflow-hidden rounded-2xl bg-gray-2 dark:bg-dark-2"
              >
                {collection.coverImage && (
                  <Image
                    src={collection.coverImage}
                    alt=""
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                )}
                <span className="relative z-10 w-full bg-gradient-to-t from-black/60 to-transparent p-5 font-medium text-white">
                  {collection.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8">
        <h2 className="text-heading-5 font-medium text-dark dark:text-white">
          Nouveautés
        </h2>

        {products.length === 0 ? (
          <p className="mt-6 text-body-sm text-dark-5 dark:text-dark-6">
            De nouvelles pièces arrivent bientôt.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
                  {formatPrice(Number(product.basePrice), settings.currency)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
