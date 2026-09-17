"use client";

import { useSession } from "@/lib/auth/auth-client";
import { useSidebarContext } from "./sidebar/sidebar-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Barre basse mobile réservée aux vendeuses — le staff plateforme (admin/
 * editor/viewer) gère trop de sections différentes (boutiques, équipe,
 * agences, tickets...) pour qu'une barre à 4 destinations fixes fasse sens ;
 * il garde le tiroir latéral classique. Une vendeuse, elle, revient
 * toujours aux 4 mêmes écrans : ça mérite un accès pouce, app-like, plutôt
 * qu'un hamburger à chaque fois. Le 5e onglet "Menu" ouvre le tiroir
 * existant pour tout le reste (SAV, coordonnées, etc.), pattern hybride
 * standard des apps vendeur e-commerce (Shopify, Etsy Seller...).
 */
export function VendorBottomNav() {
  const pathname = usePathname();
  const session = useSession();
  const { setIsOpen } = useSidebarContext();
  const role = (session.data?.user as { role?: string } | undefined)?.role;

  if (role !== "vendeur") return null;

  const items = [
    { href: "/2558588dca9a/orders", label: "Commandes", icon: OrdersIcon },
    { href: "/2558588dca9a/products", label: "Produits", icon: BagIcon },
    { href: "/2558588dca9a/live", label: "Live", icon: LiveIcon },
    { href: "/2558588dca9a/wallet", label: "Portefeuille", icon: WalletIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stroke bg-white/95 backdrop-blur md:hidden dark:border-dark-3 dark:bg-gray-dark/95">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-body-xs font-medium ${
              isActive ? "text-primary" : "text-dark-5 dark:text-dark-6"
            }`}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-body-xs font-medium text-dark-5 dark:text-dark-6"
      >
        <MenuIcon />
        Menu
      </button>
    </nav>
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

function OrdersIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 4h16v4H4z" />
      <path d="M6 8v12h12V8" />
      <path d="M10 12h4" />
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

function LiveIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="16" cy="12" r="1.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
