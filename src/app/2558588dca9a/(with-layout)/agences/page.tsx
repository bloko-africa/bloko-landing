import { DeleteRowButton } from "@/components/Admin/delete-row-button";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { deleteAgence } from "@/lib/actions/livraisons";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agences de livraison",
};

export const dynamic = "force-dynamic";

export default async function AgencesPage() {
  const agences = await db.agence.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { livraisons: true } } },
  });

  return (
    <>
      <Breadcrumb pageName="Agences de livraison" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/2558588dca9a/agences/new"
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Nouvelle agence
        </Link>
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Nom
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Téléphone
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Zones
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Livraisons
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Statut
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {agences.map((agence) => (
              <tr
                key={agence.id}
                className="border-b border-stroke last:border-0 dark:border-dark-3"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/agences/${agence.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {agence.name}
                  </Link>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {agence.phone ?? "—"}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {agence.zones.length > 0 ? agence.zones.join(", ") : "—"}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {agence._count.livraisons}
                </td>
                <td className="px-5.5 py-4">
                  <span
                    className={
                      agence.isActive
                        ? "rounded-full bg-green-light-6 px-3 py-1 text-body-xs font-medium text-green-dark"
                        : "rounded-full bg-gray-2 px-3 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-2 dark:text-dark-6"
                    }
                  >
                    {agence.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5.5 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/2558588dca9a/agences/${agence.id}`}
                      className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                    >
                      Modifier
                    </Link>
                    <DeleteRowButton
                      id={agence.id}
                      action={deleteAgence}
                      confirmMessage={`Supprimer l'agence "${agence.name}" ? Les livraisons déjà rattachées gardent leur historique mais perdent leur agence.`}
                      successMessage="Agence supprimée"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {agences.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucune agence pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
