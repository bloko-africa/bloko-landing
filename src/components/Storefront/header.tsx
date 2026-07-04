"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useSession } from "@/lib/auth/auth-client";
import Link from "next/link";

type StorefrontHeaderProps = {
  storeName: string;
};

export function StorefrontHeader({ storeName }: StorefrontHeaderProps) {
  const { totalItems } = useCart();
  const session = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-stroke bg-white/90 backdrop-blur dark:border-dark-3 dark:bg-gray-dark/90">
      <div className="mx-auto grid h-18 max-w-(--breakpoint-2xl) grid-cols-2 items-center px-4 md:grid-cols-3 md:px-8">
        <nav className="hidden items-center gap-8 text-body-xs font-medium uppercase tracking-wide text-dark-5 dark:text-dark-6 md:flex">
          <Link href="/" className="hover:text-primary">
            Accueil
          </Link>
          <Link href="/produits" className="hover:text-primary">
            Boutique
          </Link>
          <Link href="/collections" className="hover:text-primary">
            Collections
          </Link>
        </nav>

        <Link
          href="/"
          className="text-heading-6 font-black uppercase tracking-tight text-dark dark:text-white md:text-center"
        >
          {storeName}
        </Link>

        <div className="flex items-center justify-end gap-5">
          <Link
            href={session.data?.session ? "/compte" : "/compte/connexion"}
            className="hidden text-body-xs font-medium uppercase tracking-wide text-dark-5 hover:text-primary dark:text-dark-6 sm:block"
          >
            {session.data?.session ? "Mon compte" : "Connexion"}
          </Link>

          <Link href="/panier" className="relative" aria-label="Panier">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-dark dark:text-white"
            >
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="19" cy="21" r="1.4" />
              <path d="M1 1h3.2l2.6 13.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L22.4 6H5" />
            </svg>

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
