import { BlokoSearchBar } from "@/components/Storefront/bloko-search-bar";
import { HeroCarousel } from "@/components/Storefront/hero-carousel";
import { db } from "@/lib/db";
import { featuredScore } from "@/lib/reviews";
import Image from "next/image";
import Link from "next/link";

const HERO_IMAGES = [
  "/hero/hero-live-selling.jpg",
  "/hero/hero-live-selling-2.jpg",
  "/hero/hero-live-selling-3.jpg",
];

// Contrairement aux pages boutique/commande (stock/prix doivent être exacts
// à la requête), cet accueil n'affiche que la liste des boutiques en
// vedette — une fraîcheur à la minute est largement suffisante et évite de
// retaper la base à chaque visite en cas de pic de trafic.
export const revalidate = 60;

export default async function BlokoHome() {
  // La note (moyenne pondérée) entre maintenant dans ce qui rend une
  // boutique "en vedette" — pas juste la date de création. Échelle actuelle
  // assez petite pour trier en JS plutôt qu'en SQL (voir featuredScore()).
  const boutiques = await db.boutique.findMany({
    where: { status: "ACTIVE" },
    select: {
      handle: true,
      displayName: true,
      logoUrl: true,
      coverImage: true,
      ville: true,
      createdAt: true,
      reviews: { select: { rating: true } },
    },
  });

  const featured = boutiques
    .map((b) => {
      const count = b.reviews.length;
      const average = count > 0 ? b.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
      return { ...b, score: featuredScore({ average, count }) };
    })
    .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return (
    <div>
      {/* Hero — noir dominant, photo de vendeuse en live TikTok en fond avec
          un voile sombre pour garantir la lisibilité du texte quel que soit
          l'appareil (pas de dépendance au cadrage précis de la photo). */}
      <section className="relative overflow-hidden bg-dark dark:bg-black">
        <HeroCarousel images={HERO_IMAGES} />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto flex max-w-(--breakpoint-md) flex-col items-center px-4 py-14 text-center md:py-20">
          <p className="text-body-xs font-medium uppercase tracking-[0.2em] text-dark-7">
            Le marché des boutiques TikTok
          </p>
          <h1 className="mt-4 text-[clamp(1.75rem,5.5vw,3.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            Trouve une boutique
            <br />
            par son @
          </h1>

          <div className="mt-8 w-full">
            <BlokoSearchBar />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-10 text-center md:px-8 md:py-12">
        {featured.length > 0 && (
          <div className="w-full">
            <p className="mb-4 text-center text-body-xs font-medium uppercase tracking-wide text-dark-5 dark:text-dark-6">
              Boutiques en vedette
            </p>
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {featured.map((b) => (
                <Link
                  key={b.handle}
                  href={`/b/${b.handle}`}
                  className="w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-stroke bg-white text-left hover:border-primary dark:border-dark-3 dark:bg-dark-2"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-2 dark:bg-dark-3">
                    {(b.coverImage || b.logoUrl) && (
                      <Image
                        src={b.coverImage ?? b.logoUrl!}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="224px"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-body-sm font-medium text-dark dark:text-white">
                      {b.displayName}
                    </p>
                    <p className="text-body-xs text-dark-5 dark:text-dark-6">
                      @{b.handle} — {b.ville}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/decouvrir"
          className="mt-8 inline-block text-body-sm font-medium uppercase tracking-wide text-dark underline-offset-4 hover:underline dark:text-white"
        >
          Découvrir tous les produits →
        </Link>
      </div>
    </div>
  );
}
