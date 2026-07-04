import { ProductCard } from "@/components/Storefront/product-card";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TRUST_BADGES = [
  {
    title: "Livraison rapide",
    subtitle: "Cotonou, Abidjan et environs",
    icon: TruckIcon,
  },
  {
    title: "Retours faciles",
    subtitle: "Sous 7 jours",
    icon: PackageIcon,
  },
  {
    title: "Qualité garantie",
    subtitle: "Pièces sélectionnées",
    icon: BadgeIcon,
  },
  {
    title: "Paiement sécurisé",
    subtitle: "Mobile Money & carte",
    icon: LockIcon,
  },
];

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
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: {
          select: { id: true, size: true, color: true, stock: true, priceOverride: true },
        },
      },
    }),
  ]);

  const featured = collections.find((c) => c.coverImage) ?? null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-1 dark:bg-dark-2">
        <div className="mx-auto grid max-w-(--breakpoint-2xl) grid-cols-1 gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-body-xs font-medium uppercase tracking-[0.2em] text-dark-5 dark:text-dark-6">
              {featured?.season ?? "Nouvelle collection"}
            </p>
            <div className="mt-3 h-px w-12 bg-primary" />

            <h1 className="mt-6 text-[clamp(2.5rem,7vw,5rem)] font-black uppercase leading-[0.95] tracking-tight text-dark dark:text-white">
              {settings.heroTitle}
            </h1>

            <p className="mt-6 max-w-md text-body-sm text-dark-5 dark:text-dark-6">
              {settings.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/produits"
                className="bg-dark px-9 py-3.5 text-body-sm font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
              >
                {settings.heroCtaLabel}
              </Link>
              <Link
                href="/produits"
                className="text-body-sm font-medium uppercase tracking-wide text-dark underline-offset-4 hover:underline dark:text-white"
              >
                Voir les nouveautés
              </Link>
            </div>
          </div>

          {featured?.coverImage && (
            <div className="relative aspect-4/5 overflow-hidden">
              <Image
                src={featured.coverImage}
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
          <div className="mx-auto grid max-w-(--breakpoint-2xl) grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/produits?collection=${collection.slug}`}
                className="group flex items-center gap-5 px-6 py-10 hover:bg-white/5 md:px-10"
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
        </section>
      )}

      {/* Rassurance */}
      <section className="border-b border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="mx-auto grid max-w-(--breakpoint-2xl) grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 md:px-8">
          {TRUST_BADGES.map(({ title, subtitle, icon: Icon }) => (
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
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
            Nouveautés
          </h2>
          <Link
            href="/produits"
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
        )}
      </section>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-dark dark:text-white">
      <path d="M1 3h13v10H1z" />
      <path d="M14 8h4l3 3v2h-7z" />
      <circle cx="6" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-dark dark:text-white">
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-dark dark:text-white">
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-2 7 5-3 5 3-2-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-dark dark:text-white">
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}
