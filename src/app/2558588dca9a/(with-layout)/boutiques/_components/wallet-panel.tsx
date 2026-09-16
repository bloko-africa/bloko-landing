"use client";

import { Select } from "@/components/FormElements/select";
import InputGroup from "@/components/FormElements/InputGroup";
import { recordPayout } from "@/lib/actions/wallet";
import { notifyPromise } from "@/lib/notify-promise";
import { formatPrice } from "@/lib/format-price";
import { PLATFORM_COMMISSION_RATE } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const METHOD_OPTIONS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "virement", label: "Virement bancaire" },
  { value: "especes", label: "Espèces" },
  { value: "autre", label: "Autre" },
];

const METHOD_LABEL: Record<string, string> = {
  mobile_money: "Mobile Money",
  virement: "Virement bancaire",
  especes: "Espèces",
  autre: "Autre",
};

type Payout = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
};

export function WalletPanel({
  boutiqueId,
  grossSales,
  commission,
  totalEarned,
  totalPaidOut,
  balance,
  currency,
  payouts,
  canRecordPayout = true,
}: {
  boutiqueId: string;
  grossSales: number;
  commission: number;
  totalEarned: number;
  totalPaidOut: number;
  balance: number;
  currency: string;
  payouts: Payout[];
  canRecordPayout?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("boutiqueId", boutiqueId);
    setLoading(true);

    try {
      await notifyPromise(recordPayout(formData), {
        loading: "Enregistrement...",
        success: "Versement enregistré",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5.5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
          <p className="text-body-xs text-dark-5 dark:text-dark-6">Gagné net (commandes payées)</p>
          <p className="mt-1 text-body-lg font-semibold text-dark dark:text-white">
            {formatPrice(totalEarned, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
          <p className="text-body-xs text-dark-5 dark:text-dark-6">Déjà versé</p>
          <p className="mt-1 text-body-lg font-semibold text-dark dark:text-white">
            {formatPrice(totalPaidOut, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-body-xs text-dark-5 dark:text-dark-6">Solde dû</p>
          <p className="mt-1 text-body-lg font-semibold text-primary">
            {formatPrice(balance, currency)}
          </p>
        </div>
      </div>
      <p className="text-body-xs text-dark-5 dark:text-dark-6">
        Ventes brutes {formatPrice(grossSales, currency)} − commission Bloko{" "}
        {PLATFORM_COMMISSION_RATE * 100}% ({formatPrice(commission, currency)}) ={" "}
        {formatPrice(totalEarned, currency)} net. Grand livre interne, pas un
        vrai séquestre : l&apos;argent transite
        par GeniusPay vers le compte plateforme, ce solde sert juste à suivre
        ce qui reste à reverser à la vendeuse en dehors de l&apos;app. Les frais
        de livraison inclus dans un paiement ne comptent ni dans le brut ni
        dans le gagné.
      </p>

      {canRecordPayout && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <InputGroup
            label="Montant à verser"
            name="amount"
            type="number"
            placeholder="0"
            required
          />
          <Select label="Moyen" name="method" items={METHOD_OPTIONS} defaultValue="mobile_money" />
          <InputGroup
            label="Référence (optionnel)"
            name="reference"
            type="text"
            placeholder="Réf. transaction"
          />
          <button
            type="submit"
            disabled={loading || balance <= 0}
            className="h-fit rounded-lg bg-primary px-5 py-3 text-body-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </form>
      )}

      {payouts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-stroke dark:border-dark-3">
          <table className="w-full table-auto text-left">
            <thead>
              <tr className="border-b border-stroke text-body-xs text-dark-5 dark:border-dark-3 dark:text-dark-6">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Montant</th>
                <th className="px-4 py-2.5 font-medium">Moyen</th>
                <th className="px-4 py-2.5 font-medium">Référence</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2">
                  <td className="px-4 py-2.5 text-body-sm text-dark-5 dark:text-dark-6">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-2.5 text-body-sm font-medium text-dark dark:text-white">
                    {formatPrice(p.amount, currency)}
                  </td>
                  <td className="px-4 py-2.5 text-body-sm text-dark-5 dark:text-dark-6">
                    {METHOD_LABEL[p.method] ?? p.method}
                  </td>
                  <td className="px-4 py-2.5 text-body-sm text-dark-5 dark:text-dark-6">
                    {p.reference ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
