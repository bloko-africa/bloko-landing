import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Boutiques",
};

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-light-4 text-yellow-dark-2",
  ACTIVE: "bg-green-light-6 text-green-dark",
  SUSPENDED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  ACTIVE: "Active",
  SUSPENDED: "Suspendue",
};

export default async function BoutiquesPage() {
  const boutiques = await db.boutique.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
  });

  return (
    <>
      <Breadcrumb pageName="Boutiques" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/2558588dca9a/boutiques/new"
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Nouvelle boutique
        </Link>
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Boutique
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Vendeuse
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Ville
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Produits
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Commandes
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
            {boutiques.map((boutique) => (
              <tr
                key={boutique.id}
                className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/boutiques/${boutique.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {boutique.displayName}
                  </Link>
                  <br />
                  <span className="text-body-xs text-dark-5 dark:text-dark-6">
                    @{boutique.handle}
                  </span>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {boutique.owner.name}
                  <br />
                  <span className="text-body-xs">{boutique.owner.email}</span>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {boutique.ville}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {boutique._count.products}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {boutique._count.orders}
                </td>
                <td className="px-5.5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-body-xs font-medium ${STATUS_STYLE[boutique.status] ?? ""}`}
                  >
                    {STATUS_LABEL[boutique.status] ?? boutique.status}
                  </span>
                </td>
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/boutiques/${boutique.id}`}
                    className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                  >
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}

            {boutiques.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
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
