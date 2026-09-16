import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pourquoi Bloko",
  description:
    "Bloko connecte les vendeuses TikTok et leurs acheteurs : boutique en ligne, paiement sécurisé, suivi de livraison et avis vérifiés.",
};

type Benefit = { icon: React.ReactNode; title: string; description: string };

function BenefitCard({ icon, title, description }: Benefit) {
  return (
    <div className="rounded-2xl border border-stroke p-6 dark:border-dark-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-dark text-white dark:bg-white dark:text-dark">
        {icon}
      </div>
      <p className="mt-4 text-body-md font-semibold text-dark dark:text-white">{title}</p>
      <p className="mt-2 text-body-sm text-dark-5 dark:text-dark-6">{description}</p>
    </div>
  );
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const vendorBenefits: Benefit[] = [
  {
    title: "Une boutique liée à ton @",
    description:
      "Pas de site à construire, pas de code. Ta boutique existe à bloko.me/b/@tonhandle dès le premier jour — le lien que tu mets en bio.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M8 12h8M12 8v8" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Livraison suivie, pas devinée",
    description:
      "Chaque commande a un statut clair — assignée, prise en charge, en route, livrée. Ni toi ni ton acheteur n'avez à demander où ça en est.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M1 3h13v10H1z" />
        <path d="M14 8h4l3 3v2h-7z" />
        <circle cx="6" cy="17" r="1.6" />
        <circle cx="17" cy="17" r="1.6" />
      </svg>
    ),
  },
  {
    title: "Ton solde, toujours visible",
    description:
      "Un portefeuille qui calcule ce que tu as gagné sur tes ventes payées, ce qui t'a déjà été versé, et ce qu'il te reste à recevoir.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Une réputation qui se construit",
    description:
      "Chaque avis vient d'un achat réellement livré. Pas de faux avis possibles — ta note reflète vraiment ce que tes clientes pensent.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z" />
      </svg>
    ),
  },
];

const buyerBenefits: Benefit[] = [
  {
    title: "Retrouve la boutique du live",
    description:
      "Tape juste le @ de la vendeuse dans la recherche — pas besoin de connaître un nom de site compliqué.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "Paiement sécurisé",
    description:
      "Mobile Money ou carte, traité par un prestataire de paiement tiers — Bloko ne voit ni ne garde jamais tes identifiants de paiement.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Tu sais où est ton colis",
    description:
      "Une notification à chaque étape importante — paiement confirmé, colis en route, livré. Pas de silence radio après l'achat.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
  {
    title: "Des avis qu'on ne peut pas truquer",
    description:
      "Seuls les acheteurs dont la commande a été livrée peuvent laisser une note — ce que tu lis vient de vraies clientes.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    ),
  },
];

export default function PourquoiBlokoPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark dark:bg-black">
        <Image
          src="/hero/hero-live-selling-2.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative mx-auto max-w-(--breakpoint-md) px-4 py-16 text-center md:py-24">
          <p className="text-body-xs font-medium uppercase tracking-[0.2em] text-dark-7">
            Pourquoi Bloko
          </p>
          <h1 className="mt-4 text-[clamp(1.75rem,5.5vw,3.25rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            Ce qui se vend en live
            <br />
            mérite mieux qu&apos;un DM
          </h1>
          <p className="mx-auto mt-6 max-w-md text-body-sm text-dark-7">
            Bloko relie chaque boutique TikTok à un vrai parcours d&apos;achat —
            commande, paiement, livraison, avis — sans que la vendeuse ait à
            construire quoi que ce soit elle-même.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="mailto:support@bloko.me"
              className="bg-white px-8 py-3.5 text-body-sm font-medium uppercase tracking-wide text-dark hover:bg-opacity-90"
            >
              Créer ma boutique
            </Link>
            <Link
              href="/decouvrir"
              className="border border-white/30 px-8 py-3.5 text-body-sm font-medium uppercase tracking-wide text-white hover:border-white"
            >
              Découvrir les boutiques
            </Link>
          </div>
        </div>
      </section>

      {/* Pour les vendeuses */}
      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-(--breakpoint-sm) text-center">
          <p className="text-body-xs font-medium uppercase tracking-[0.2em] text-dark-5 dark:text-dark-6">
            Pour les vendeuses
          </p>
          <h2 className="mt-3 text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
            Transforme ton live en vraie boutique
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {vendorBenefits.map((b) => (
            <BenefitCard key={b.title} {...b} />
          ))}
        </div>
      </section>

      {/* Preuve photo — vendeuses en live */}
      <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-16 md:px-8">
        <div className="grid grid-cols-3 gap-3 overflow-hidden rounded-2xl">
          {["/hero/hero-live-selling.jpg", "/hero/hero-live-selling-2.jpg", "/hero/hero-live-selling-3.jpg"].map(
            (src) => (
              <div key={src} className="relative aspect-square">
                <Image src={src} alt="" fill className="object-cover" sizes="33vw" />
              </div>
            ),
          )}
        </div>
      </section>

      {/* Pour les clients */}
      <section className="border-y border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-(--breakpoint-sm) text-center">
            <p className="text-body-xs font-medium uppercase tracking-[0.2em] text-dark-5 dark:text-dark-6">
              Pour les clients
            </p>
            <h2 className="mt-3 text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
              Achète directement depuis le live
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buyerBenefits.map((b) => (
              <BenefitCard key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-dark dark:bg-black">
        <div className="mx-auto max-w-(--breakpoint-sm) px-4 py-16 text-center md:py-20">
          <h2 className="text-heading-6 font-bold uppercase tracking-tight text-white">
            Tu vends déjà sur TikTok ?
          </h2>
          <p className="mt-3 text-body-sm text-dark-7">
            Écris-nous, on met ta boutique en ligne.
          </p>
          <Link
            href="mailto:support@bloko.me"
            className="mt-8 inline-block bg-white px-8 py-3.5 text-body-sm font-medium uppercase tracking-wide text-dark hover:bg-opacity-90"
          >
            support@bloko.me
          </Link>
        </div>
      </section>
    </div>
  );
}
