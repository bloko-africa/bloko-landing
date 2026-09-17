"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "bloko-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Stockage indisponible (navigation privée, etc.) — pas grave, la
    // bannière réapparaîtra à la prochaine visite, sans casser la page.
  }
}

/**
 * Bloko n'a pas de fiche app store : c'est ce bandeau qui remplace la
 * découverte "installer l'app" — utile aussi bien pour une vendeuse qui
 * veut lancer Bloko comme une vraie app pendant un live que pour une
 * cliente qui revient régulièrement sur une boutique. Android/Chrome a un
 * évènement natif (beforeinstallprompt) ; iOS Safari n'en déclenche jamais
 * et n'expose pas d'API pour installer par code — juste des instructions.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;
    setDismissed(false);

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function handleDismiss() {
    dismiss();
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-105 rounded-2xl border border-stroke bg-white p-4 shadow-2 md:bottom-6 dark:border-dark-3 dark:bg-gray-dark">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-dark text-body-sm font-black text-white dark:bg-white dark:text-dark">
          B
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-dark dark:text-white">
            Installer Bloko
          </p>
          {showIosHint ? (
            <p className="mt-0.5 text-body-xs text-dark-5 dark:text-dark-6">
              Appuie sur <span className="font-medium">Partager</span> puis{" "}
              <span className="font-medium">Sur l&apos;écran d&apos;accueil</span>.
            </p>
          ) : (
            <p className="mt-0.5 text-body-xs text-dark-5 dark:text-dark-6">
              Accès direct depuis ton écran d&apos;accueil, comme une vraie app.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          className="shrink-0 text-dark-5 hover:text-dark dark:text-dark-6 dark:hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {!showIosHint && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-3 w-full rounded-lg bg-primary py-2.5 text-body-sm font-medium text-white hover:bg-opacity-90"
        >
          Installer
        </button>
      )}
    </div>
  );
}
