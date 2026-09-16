import { ProductCard } from "@/components/Storefront/product-card";
import { StarDisplay } from "@/components/Storefront/review-form";
import { db } from "@/lib/db";
import { getBoutiqueByHandle } from "@/lib/boutique";
import { getBoutiqueRating } from "@/lib/reviews";
import { TRUST_BADGE_ICON_COMPONENTS, parseTrustBadges } from "@/lib/trust-badge-icons";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) return { title: "Boutique" };

  const title = `${boutique.displayName} (@${boutique.handle})`;
  const description =
    boutique.bio || boutique.heroSubtitle || `Découvre la boutique ${boutique.displayName} sur Bloko, le marché des boutiques TikTok.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: boutique.coverImage ? [{ url: boutique.coverImage }] : undefined,
    },
  };
}

export default async function BoutiqueHome({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) notFound();

  const COLLECTIONS_PREVIEW = 6;

  const [collections, collectionsTotal, products, rating, reviews] = await Promise.all([
    db.collection.findMany({
      where: { boutiqueId: boutique.id, isActive: true },
      orderBy: { createdAt: "desc" },
      take: COLLECTIONS_PREVIEW,
    }),
    db.collection.count({ where: { boutiqueId: boutique.id, isActive: true } }),
    db.product.findMany({
      where: { boutiqueId: boutique.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: {
          select: { id: true, size: true, color: true, stock: true, priceOverride: true },
        },
      },
    }),
    getBoutiqueRating(boutique.id),
    db.review.findMany({
      where: { boutiqueId: boutique.id, comment: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const trustBadges = parseTrustBadges(boutique.trustBadges);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-1 dark:bg-dark-2">
        <div className="mx-auto grid max-w-(--breakpoint-2xl) grid-cols-1 gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            {boutique.heroEyebrow && (
              <p className="text-body-xs font-medium uppercase tracking-[0.2em] text-dark-5 dark:text-dark-6">
                {boutique.heroEyebrow}
              </p>
            )}
            <div className="mt-3 h-px w-12 bg-primary" />

            <h1 className="mt-6 text-[clamp(2.5rem,7vw,5rem)] font-black uppercase leading-[0.95] tracking-tight text-dark dark:text-white">
              {boutique.heroTitle ?? boutique.displayName}
            </h1>

            {boutique.heroSubtitle && (
              <p className="mt-6 max-w-md text-body-sm text-dark-5 dark:text-dark-6">
                {boutique.heroSubtitle}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={`/b/${boutique.handle}/produits`}
                className="bg-dark px-9 py-3.5 text-body-sm font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
              >
                {boutique.heroCtaLabel ?? "Découvrir la boutique"}
              </Link>
              {rating.count > 0 && (
                <div className="flex items-center gap-2">
                  <StarDisplay rating={rating.average} />
                  <span className="text-body-sm text-dark-5 dark:text-dark-6">
                    {rating.average.toFixed(1)} ({rating.count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {boutique.featuredCollection?.coverImage && (
            <div className="relative aspect-4/5 overflow-hidden">
              <Image
                src={boutique.featuredCollection.coverImage}
                alt=""
                fill
                priority
                className="object-cover grayscale-[15%]"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
          )}
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="bg-dark dark:bg-black">
          <div className="scrollbar-hide flex snap-x snap-mandatory gap-px overflow-x-auto sm:grid sm:max-w-(--breakpoint-2xl) sm:grid-cols-3 sm:divide-x sm:divide-white/10 sm:overflow-visible sm:mx-auto">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/b/${boutique.handle}/produits?collection=${collection.slug}`}
                className="group flex w-[82%] shrink-0 snap-start items-center gap-5 border-b border-white/10 px-6 py-10 hover:bg-white/5 sm:w-auto sm:shrink sm:border-b-0 md:px-10"
              >
                {collection.coverImage && (
                  <div className="relative size-20 shrink-0 overflow-hidden">
                    <Image
                      src={collection.coverImage}
                      alt=""
                      fill
                      className="object-cover grayscale"
                      sizes="80px"
                    />
                  </div>
                )}
                <div>
                  <p className="text-body-lg font-bold uppercase tracking-wide text-white">
                    {collection.name}
                  </p>
                  {collection.description && (
                    <p className="mt-1 max-w-50 text-body-xs text-dark-7">
                      {collection.description}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-body-xs font-medium uppercase tracking-wide text-white underline-offset-4 group-hover:underline">
                    Découvrir →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {collectionsTotal > collections.length && (
            <div className="border-t border-white/10 py-6 text-center">
              <Link
                href={`/b/${boutique.handle}/collections`}
                className="text-body-sm font-medium uppercase tracking-wide text-white underline-offset-4 hover:underline"
              >
                Voir toutes les collections →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Rassurance */}
      <section className="border-b border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="mx-auto grid max-w-(--breakpoint-2xl) grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 md:px-8">
          {trustBadges.map(({ icon, title, subtitle }) => {
            const Icon = TRUST_BADGE_ICON_COMPONENTS[icon];
            return (
              <div
                key={title}
                className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
              >
                <Icon />
                <div>
                  <p className="text-body-sm font-medium uppercase tracking-wide text-dark dark:text-white">
                    {title}
                  </p>
                  <p className="text-body-xs text-dark-5 dark:text-dark-6">
                    {subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
            Nouveautés
          </h2>
          <Link
            href={`/b/${boutique.handle}/produits`}
            className="text-body-sm font-medium uppercase tracking-wide text-dark underline-offset-4 hover:underline dark:text-white"
          >
            Voir tout
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="mt-6 text-body-sm text-dark-5 dark:text-dark-6">
            De nouvelles pièces arrivent bientôt.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                image={product.images[0]?.url ?? null}
                basePrice={Number(product.basePrice)}
                currency={boutique.currency}
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
        )}
      </section>

      {/* Avis */}
      {rating.count > 0 && (
        <section className="border-t border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
          <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8">
            <div className="flex items-center gap-3">
              <StarDisplay rating={rating.average} />
              <p className="text-body-sm font-medium text-dark dark:text-white">
                {rating.average.toFixed(1)} / 5
              </p>
              <p className="text-body-sm text-dark-5 dark:text-dark-6">
                ({rating.count} avis)
              </p>
            </div>

            {reviews.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark"
                  >
                    <StarDisplay rating={review.rating} />
                    <p className="mt-3 text-body-sm text-dark-5 dark:text-dark-6">
                      {review.comment}
                    </p>
                    <p className="mt-3 text-body-xs font-medium uppercase tracking-wide text-dark-5 dark:text-dark-6">
                      {review.user.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
