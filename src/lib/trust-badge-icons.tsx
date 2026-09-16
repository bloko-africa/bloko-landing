export const TRUST_BADGE_ICON_KEYS = [
  "truck",
  "package",
  "badge",
  "lock",
  "shield",
  "star",
] as const;

export type TrustBadgeIconKey = (typeof TRUST_BADGE_ICON_KEYS)[number];

export type TrustBadge = {
  icon: TrustBadgeIconKey;
  title: string;
  subtitle: string;
};

export const TRUST_BADGE_ICON_LABELS: Record<TrustBadgeIconKey, string> = {
  truck: "Camion (livraison)",
  package: "Colis (retours)",
  badge: "Badge (qualité)",
  lock: "Cadenas (paiement)",
  shield: "Bouclier (garantie)",
  star: "Étoile (satisfaction)",
};

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

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-dark dark:text-white">
      <path d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-dark dark:text-white">
      <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 3Z" />
    </svg>
  );
}

export const TRUST_BADGE_ICON_COMPONENTS: Record<
  TrustBadgeIconKey,
  () => React.JSX.Element
> = {
  truck: TruckIcon,
  package: PackageIcon,
  badge: BadgeIcon,
  lock: LockIcon,
  shield: ShieldIcon,
  star: StarIcon,
};

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  {
    icon: "truck",
    title: "Livraison rapide",
    subtitle: "Cotonou, Abidjan et environs",
  },
  {
    icon: "package",
    title: "Retours faciles",
    subtitle: "Sous 7 jours",
  },
  {
    icon: "badge",
    title: "Qualité garantie",
    subtitle: "Pièces sélectionnées",
  },
  {
    icon: "lock",
    title: "Paiement sécurisé",
    subtitle: "Mobile Money & carte",
  },
];

/**
 * Valide/normalise une valeur JSON lue en base (Boutique.trustBadges ou
 * StoreSettings.trustBadges) vers TrustBadge[] — retombe sur les 4 badges
 * par défaut si absent ou invalide plutôt que de planter le rendu.
 */
export function parseTrustBadges(value: unknown): TrustBadge[] {
  if (!Array.isArray(value)) return DEFAULT_TRUST_BADGES;
  const valid = value.filter(
    (v): v is TrustBadge =>
      typeof v === "object" &&
      v !== null &&
      TRUST_BADGE_ICON_KEYS.includes((v as TrustBadge).icon) &&
      typeof (v as TrustBadge).title === "string" &&
      typeof (v as TrustBadge).subtitle === "string",
  );
  return valid.length > 0 ? valid : DEFAULT_TRUST_BADGES;
}
