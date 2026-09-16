import { DeleteRowButton } from "@/components/Admin/delete-row-button";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { deleteCategory } from "@/lib/actions/categories";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catégories",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <>
      <Breadcrumb pageName="Catégories" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/2558588dca9a/categories/new"
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Nouvelle catégorie
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
                Parent
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Produits
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-stroke last:border-0 dark:border-dark-3"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/categories/${category.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {category.name}
                  </Link>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {category.parent?.name ?? "—"}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {category._count.products}
                </td>
                <td className="px-5.5 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/2558588dca9a/categories/${category.id}`}
                      className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                    >
                      Modifier
                    </Link>
                    <DeleteRowButton
                      id={category.id}
                      action={deleteCategory}
                      confirmMessage={`Supprimer la catégorie "${category.name}" ?`}
                      successMessage="Catégorie supprimée"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucune catégorie pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
