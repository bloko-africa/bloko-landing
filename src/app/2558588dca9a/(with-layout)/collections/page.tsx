import { DeleteRowButton } from "@/components/Admin/delete-row-button";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { deleteCollection } from "@/lib/actions/collections";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);

  const collections = await db.collection.findMany({
    where: { boutiqueId: scopedBoutiqueId },
    orderBy: { createdAt: "desc" },
    include: {
      boutique: { select: { displayName: true } },
      _count: { select: { products: true } },
    },
  });
  const showBoutiqueColumn = !scopedBoutiqueId;

  return (
    <>
      <Breadcrumb pageName="Collections" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/2558588dca9a/collections/new"
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Nouvelle collection
        </Link>
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Nom
              </th>
              {showBoutiqueColumn && (
                <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                  Boutique
                </th>
              )}
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Saison
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Produits
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
            {collections.map((collection) => (
              <tr
                key={collection.id}
                className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/collections/${collection.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {collection.name}
                  </Link>
                </td>
                {showBoutiqueColumn && (
                  <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                    {collection.boutique.displayName}
                  </td>
                )}
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {collection.season ?? "—"}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {collection._count.products}
                </td>
                <td className="px-5.5 py-4">
                  <span
                    className={
                      collection.isActive
                        ? "rounded-full bg-green-light-6 px-3 py-1 text-body-xs font-medium text-green-dark"
                        : "rounded-full bg-gray-2 px-3 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-2 dark:text-dark-6"
                    }
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5.5 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/2558588dca9a/collections/${collection.id}`}
                      className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                    >
                      Modifier
                    </Link>
                    <DeleteRowButton
                      id={collection.id}
                      action={deleteCollection}
                      confirmMessage={`Supprimer la collection "${collection.name}" ?`}
                      successMessage="Collection supprimée"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {collections.length === 0 && (
              <tr>
                <td
                  colSpan={showBoutiqueColumn ? 6 : 5}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucune collection pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
