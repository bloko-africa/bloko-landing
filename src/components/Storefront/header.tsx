"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useSession } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useState } from "react";

type StorefrontHeaderProps = {
  storeName: string;
  handle: string;
};

export function StorefrontHeader({ storeName, handle }: StorefrontHeaderProps) {
  const { totalItems } = useCart();
  const session = useSession();
  const base = `/b/${handle}`;
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: base, label: "Accueil" },
    { href: `${base}/produits`, label: "Boutique" },
    { href: `${base}/collections`, label: "Collections" },
  ];
  const accountHref = session.data?.session ? `${base}/compte` : `${base}/compte/connexion`;
  const accountLabel = session.data?.session ? "Mon compte" : "Connexion";

  return (
    <header className="sticky top-0 z-30 border-b border-stroke bg-white/90 backdrop-blur dark:border-dark-3 dark:bg-gray-dark/90">
      <div className="mx-auto grid h-18 max-w-(--breakpoint-2xl) grid-cols-2 items-center px-4 md:grid-cols-3 md:px-8">
        <nav className="hidden items-center gap-8 text-body-xs font-medium uppercase tracking-wide text-dark-5 dark:text-dark-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          className="flex size-10 items-center justify-center text-dark dark:text-white md:hidden"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>

        <Link
          href={base}
          className="text-heading-6 font-black uppercase tracking-tight text-dark dark:text-white md:text-center"
        >
          {storeName}
        </Link>

        <div className="flex items-center justify-end gap-5">
          <Link
            href={accountHref}
            className="hidden text-body-xs font-medium uppercase tracking-wide text-dark-5 hover:text-primary dark:text-dark-6 sm:block"
          >
            {accountLabel}
          </Link>

          <Link href={`${base}/panier`} className="relative" aria-label="Panier">
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

      {menuOpen && (
        <nav className="flex flex-col border-t border-stroke bg-white px-4 py-2 dark:border-dark-3 dark:bg-gray-dark md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3.5 text-body-sm font-medium uppercase tracking-wide text-dark-5 hover:text-primary dark:text-dark-6"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={accountHref}
            onClick={() => setMenuOpen(false)}
            className="border-t border-stroke py-3.5 text-body-sm font-medium uppercase tracking-wide text-dark-5 hover:text-primary dark:border-dark-3 dark:text-dark-6"
          >
            {accountLabel}
          </Link>
        </nav>
      )}
    </header>
  );
}
