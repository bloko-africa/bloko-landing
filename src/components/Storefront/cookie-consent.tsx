"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent({ mentionsHref = "/mentions-legales" }: { mentionsHref?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stroke bg-white/95 backdrop-blur dark:border-dark-3 dark:bg-gray-dark/95">
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col items-start gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-body-sm text-dark-5 dark:text-dark-6">
          Ce site utilise des cookies strictement nécessaires à son
          fonctionnement (panier, connexion). En savoir plus dans nos{" "}
          <Link
            href={mentionsHref}
            className="text-dark underline underline-offset-2 dark:text-white"
          >
            mentions légales
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-dark px-6 py-2.5 text-body-sm font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
