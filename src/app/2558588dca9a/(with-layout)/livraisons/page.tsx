import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  LIVRAISON_STATUS_LABEL as STATUS_LABEL,
  LIVRAISON_STATUS_STYLE as STATUS_STYLE,
} from "@/lib/livraison-status";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Livraisons",
};

export const dynamic = "force-dynamic";

export default async function LivraisonsPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);

  const livraisons = await db.livraison.findMany({
    where: scopedBoutiqueId ? { order: { boutiqueId: scopedBoutiqueId } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: {
        select: {
          reference: true,
          customerName: true,
          boutique: { select: { displayName: true } },
        },
      },
      agence: { select: { name: true } },
    },
  });
  const showBoutiqueColumn = !scopedBoutiqueId;

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <Breadcrumb pageName="Livraisons" />
        {scopedBoutiqueId && (
          <a
            href={`/2558588dca9a/api/boutiques/${scopedBoutiqueId}/export?format=csv`}
            className="text-body-sm font-medium text-primary hover:underline"
          >
            Exporter le grand livre (CSV) →
          </a>
        )}
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Commande
              </th>
              {showBoutiqueColumn && (
                <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                  Boutique
                </th>
              )}
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Client
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Agence
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Statut
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Mise à jour
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {livraisons.map((livraison) => (
              <tr
                key={livraison.id}
                className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                <td className="px-5.5 py-4 font-medium text-dark dark:text-white">
                  {livraison.order.reference}
                </td>
                {showBoutiqueColumn && (
                  <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                    {livraison.order.boutique.displayName}
                  </td>
                )}
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {livraison.order.customerName}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {livraison.agence?.name ?? "—"}
                </td>
                <td className="px-5.5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-body-xs font-medium ${STATUS_STYLE[livraison.status] ?? ""}`}
                  >
                    {STATUS_LABEL[livraison.status] ?? livraison.status}
                  </span>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {livraison.updatedAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/livraisons/${livraison.id}`}
                    className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                  >
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}

            {livraisons.length === 0 && (
              <tr>
                <td
                  colSpan={showBoutiqueColumn ? 7 : 6}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucune livraison pour le moment — une ligne apparaît
                  automatiquement dès qu&apos;une commande est payée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
