import { DeleteRowButton } from "@/components/Admin/delete-row-button";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { deleteProduct } from "@/lib/actions/products";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Produits",
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export default async function ProductsPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);

  const products = await db.product.findMany({
      where: { boutiqueId: scopedBoutiqueId },
      orderBy: { createdAt: "desc" },
      include: {
        // La devise vient de la boutique du produit, pas d'un réglage
        // plateforme global — chaque boutique a la sienne.
        boutique: { select: { displayName: true, currency: true } },
        collection: { select: { name: true } },
        variants: { select: { stock: true } },
      },
    });
  const showBoutiqueColumn = !scopedBoutiqueId;

  return (
    <>
      <Breadcrumb pageName="Produits" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/2558588dca9a/products/new"
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Nouveau produit
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
                Collection
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Prix de base
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Stock total
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
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/2558588dca9a/products/${product.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {product.name}
                  </Link>
                </td>
                {showBoutiqueColumn && (
                  <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                    {product.boutique.displayName}
                  </td>
                )}
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {product.collection?.name ?? "—"}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {formatPrice(Number(product.basePrice), product.boutique.currency)}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                </td>
                <td className="px-5.5 py-4">
                  <span className="rounded-full bg-gray-2 px-3 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-2 dark:text-dark-6">
                    {STATUS_LABEL[product.status]}
                  </span>
                </td>
                <td className="px-5.5 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/2558588dca9a/products/${product.id}`}
                      className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                    >
                      Modifier
                    </Link>
                    <DeleteRowButton
                      id={product.id}
                      action={deleteProduct}
                      confirmMessage={`Supprimer le produit "${product.name}" ?`}
                      successMessage="Produit supprimé"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={showBoutiqueColumn ? 7 : 6}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucun produit pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
