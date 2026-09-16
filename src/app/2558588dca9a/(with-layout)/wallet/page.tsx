import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getWalletSummary, getWalletSummaries } from "@/lib/wallet";
import { formatPrice } from "@/lib/format-price";
import { WalletPanel } from "../boutiques/_components/wallet-panel";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Portefeuille" };
export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);

  if (scopedBoutiqueId) {
    // Vendeuse : sa propre boutique, lecture seule — l'enregistrement d'un
    // versement reste une action admin (voir recordPayout).
    const [wallet, payouts] = await Promise.all([
      getWalletSummary(scopedBoutiqueId),
      db.payoutRecord.findMany({
        where: { boutiqueId: scopedBoutiqueId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return (
      <div className="mx-auto w-full max-w-180">
        <Breadcrumb pageName="Portefeuille" />
        <ShowcaseSection title="Ton solde" className="p-6.5!">
          <WalletPanel
            boutiqueId={scopedBoutiqueId}
            totalEarned={wallet.totalEarned}
            totalPaidOut={wallet.totalPaidOut}
            balance={wallet.balance}
            currency={wallet.currency}
            canRecordPayout={false}
            payouts={payouts.map((p) => ({
              id: p.id,
              amount: Number(p.amount),
              method: p.method,
              reference: p.reference,
              note: p.note,
              createdAt: p.createdAt.toISOString(),
            }))}
          />
        </ShowcaseSection>
      </div>
    );
  }

  // Staff plateforme : vue d'ensemble de toutes les boutiques, chacune
  // renvoyant vers sa fiche pour enregistrer un versement.
  const boutiques = await db.boutique.findMany({
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true, handle: true, currency: true },
  });
  const walletsByBoutique = await getWalletSummaries(boutiques.map((b) => b.id));
  const summaries = boutiques.map((b) => ({
    ...b,
    wallet: walletsByBoutique.get(b.id) ?? {
      totalEarned: 0,
      totalPaidOut: 0,
      balance: 0,
      currency: b.currency,
    },
  }));

  return (
    <>
      <Breadcrumb pageName="Portefeuille" />
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Boutique</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Gagné</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Versé</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Solde dû</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((b) => (
              <tr key={b.id} className="border-b border-stroke last:border-0 dark:border-dark-3">
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/boutiques/${b.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {b.displayName}
                  </Link>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {formatPrice(b.wallet.totalEarned, b.currency)}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {formatPrice(b.wallet.totalPaidOut, b.currency)}
                </td>
                <td className="px-5.5 py-4 font-medium text-primary">
                  {formatPrice(b.wallet.balance, b.currency)}
                </td>
              </tr>
            ))}

            {summaries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5.5 py-8 text-center text-body-sm text-dark-5 dark:text-dark-6">
                  Aucune boutique pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
