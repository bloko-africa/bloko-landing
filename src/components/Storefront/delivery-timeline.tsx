import { LIVRAISON_STATUS_LABEL, LIVRAISON_TIMELINE_STEPS } from "@/lib/livraison-status";

type DeliveryTimelineProps = {
  status: string;
  trackingCode?: string | null;
};

const STEP_LABEL: Record<string, string> = {
  A_ASSIGNER: "Commande reçue",
  PRISE_EN_CHARGE: "Prise en charge",
  EN_ROUTE: "En route",
  LIVREE: "Livrée",
};

/**
 * Timeline visuelle simple (4 étapes, icône + libellé court) plutôt qu'un
 * badge de statut texte — plus lisible d'un coup d'œil, y compris pour un
 * acheteur peu familier avec ce genre d'interface. ECHEC/RETOUR sortent du
 * chemin normal et s'affichent comme un message à part, pas dans la ligne.
 */
export function DeliveryTimeline({ status, trackingCode }: DeliveryTimelineProps) {
  if (status === "ECHEC" || status === "RETOUR") {
    return (
      <div className="rounded-lg border border-red-light-4 bg-red-light-6 px-4 py-3 text-body-sm text-red-dark dark:bg-dark-2">
        {status === "ECHEC"
          ? "La livraison a rencontré un problème — la boutique va te recontacter."
          : "Le colis a été retourné à l'expéditeur."}
      </div>
    );
  }

  const currentIndex = LIVRAISON_TIMELINE_STEPS.indexOf(
    status as (typeof LIVRAISON_TIMELINE_STEPS)[number],
  );

  return (
    <div>
      <div className="flex items-center">
        {LIVRAISON_TIMELINE_STEPS.map((step, i) => {
          const done = i <= currentIndex;
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={
                    done
                      ? "flex size-8 items-center justify-center rounded-full bg-primary text-white"
                      : "flex size-8 items-center justify-center rounded-full border-2 border-stroke text-dark-5 dark:border-dark-3 dark:text-dark-6"
                  }
                >
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  ) : (
                    <span className="text-body-xs font-semibold">{i + 1}</span>
                  )}
                </div>
                <span className="max-w-16 text-center text-body-xs text-dark-5 dark:text-dark-6">
                  {STEP_LABEL[step]}
                </span>
              </div>
              {i < LIVRAISON_TIMELINE_STEPS.length - 1 && (
                <div
                  className={
                    i < currentIndex
                      ? "mx-1 mb-6 h-0.5 flex-1 bg-primary"
                      : "mx-1 mb-6 h-0.5 flex-1 bg-stroke dark:bg-dark-3"
                  }
                />
              )}
            </div>
          );
        })}
      </div>
      {trackingCode && (
        <p className="mt-4 text-center text-body-xs text-dark-5 dark:text-dark-6">
          Code de suivi : <span className="font-medium text-dark dark:text-white">{trackingCode}</span>
        </p>
      )}
    </div>
  );
}

/** Badge compact pour une liste de commandes (pas la timeline complète). */
export function DeliveryStatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-gray-2 px-3 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-2 dark:text-dark-6">
      {LIVRAISON_STATUS_LABEL[status] ?? status}
    </span>
  );
}
