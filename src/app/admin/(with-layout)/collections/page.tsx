import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <Breadcrumb pageName="Collections" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/admin/collections/new"
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
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Saison
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Produits
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr
                key={collection.id}
                className="border-b border-stroke last:border-0 dark:border-dark-3"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/admin/collections/${collection.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {collection.name}
                  </Link>
                </td>
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
              </tr>
            ))}

            {collections.length === 0 && (
              <tr>
                <td
                  colSpan={4}
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
