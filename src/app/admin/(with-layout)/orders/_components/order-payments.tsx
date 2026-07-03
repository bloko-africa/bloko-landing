"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { generatePaymentLink, refreshPaymentStatus } from "@/lib/actions/orders";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Payment = {
  id: string;
  reference: string;
  status: string;
  amount: string;
  checkoutUrl: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-light-4 text-yellow-dark-2",
  PROCESSING: "bg-blue-light-5 text-blue-dark",
  COMPLETED: "bg-green-light-6 text-green-dark",
  FAILED: "bg-red-light-5 text-red-dark",
  EXPIRED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
  CANCELLED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
  REFUNDED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
};

export function OrderPayments({
  orderId,
  payments,
  orderIsPaid,
}: {
  orderId: string;
  payments: Payment[];
  orderIsPaid: boolean;
}) {
  const router = useRouter();
  const [country, setCountry] = useState<"CI" | "BJ">("CI");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const url = await notifyPromise(generatePaymentLink(orderId, country), {
        loading: "Génération du lien de paiement...",
        success: "Lien de paiement généré",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.info("Lien copié dans le presse-papier");
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleRefresh(paymentId: string) {
    await notifyPromise(refreshPaymentStatus(paymentId), {
      loading: "Vérification du statut...",
      success: "Statut mis à jour",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.refresh();
  }

  return (
    <ShowcaseSection title="Paiement GeniusPay" className="space-y-5.5 p-6.5!">
      {!orderIsPaid && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-3">
            <span className="block text-body-sm font-medium text-dark dark:text-white">
              Pays du client
            </span>
            <div className="flex gap-2">
              {(["CI", "BJ"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCountry(code)}
                  className={
                    country === code
                      ? "rounded-full bg-primary px-4 py-1.5 text-body-xs font-medium text-white"
                      : "rounded-full border border-stroke px-4 py-1.5 text-body-xs font-medium text-dark-5 dark:border-dark-3 dark:text-dark-6"
                  }
                >
                  {code === "CI" ? "Côte d'Ivoire" : "Bénin"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
          >
            Générer un lien de paiement
          </button>
        </div>
      )}

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke p-4 dark:border-dark-3"
          >
            <div>
              <p className="font-medium text-dark dark:text-white">
                {payment.reference}
              </p>
              <p className="text-body-sm text-dark-5 dark:text-dark-6">
                {Number(payment.amount).toLocaleString("fr-FR")} XOF —{" "}
                {new Date(payment.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-body-xs font-medium ${STATUS_STYLE[payment.status] ?? ""}`}
              >
                {payment.status}
              </span>

              {payment.checkoutUrl && (
                <a
                  href={payment.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body-sm text-primary hover:underline"
                >
                  Lien
                </a>
              )}

              <button
                onClick={() => handleRefresh(payment.id)}
                className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
              >
                Vérifier
              </button>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <p className="text-body-sm text-dark-5 dark:text-dark-6">
            Aucune tentative de paiement pour cette commande.
          </p>
        )}
      </div>
    </ShowcaseSection>
  );
}
