"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useSession } from "@/lib/auth/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Barre de navigation basse, mobile uniquement (md:hidden) — le hamburger
 * seul dans le header n'expose pas les actions fréquentes (panier, compte)
 * en un tap, contrairement à un pattern app native. 4 destinations, dans
 * la zone atteignable au pouce, cohérent avec les recommandations e-commerce
 * mobile (3-5 items max en barre basse).
 */
export function StorefrontBottomNav({ handle }: { handle: string }) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const session = useSession();
  const base = `/b/${handle}`;

  const accountHref = session.data?.session ? `${base}/compte` : `${base}/compte/connexion`;

  const items = [
    { href: base, label: "Accueil", icon: HomeIcon, exact: true },
    { href: `${base}/produits`, label: "Boutique", icon: BagIcon, exact: false },
    { href: `${base}/panier`, label: "Panier", icon: CartIcon, exact: false, badge: totalItems },
    { href: accountHref, label: "Compte", icon: UserIcon, exact: false },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stroke bg-white/95 backdrop-blur md:hidden dark:border-dark-3 dark:bg-gray-dark/95">
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-body-xs font-medium ${
              isActive ? "text-primary" : "text-dark-5 dark:text-dark-6"
            }`}
          >
            <span className="relative">
              <Icon />
              {!!item.badge && (
                <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-white">
                  {item.badge}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="19" cy="21" r="1.4" />
      <path d="M1 1h3.2l2.6 13.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L22.4 6H5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}
