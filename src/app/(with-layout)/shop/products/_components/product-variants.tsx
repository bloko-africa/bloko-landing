"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  addProductVariant,
  deleteProductVariant,
  updateVariantStock,
} from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  priceOverride: string | null;
};

export function ProductVariants({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);
    setAdding(true);

    try {
      await toast.promise(addProductVariant(formData), {
        loading: "Ajout de la variante...",
        success: "Variante ajoutée",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function handleStockChange(variantId: string, value: string) {
    const stock = Number(value);
    if (!Number.isFinite(stock) || stock < 0) return;

    try {
      await updateVariantStock(variantId, stock);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec mise à jour stock");
    }
  }

  async function handleDelete(variantId: string) {
    if (!confirm("Supprimer cette variante ?")) return;

    await toast.promise(deleteProductVariant(variantId), {
      loading: "Suppression...",
      success: "Variante supprimée",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.refresh();
  }

  return (
    <ShowcaseSection title="Variantes (taille / couleur)" className="p-6.5!">
      <div className="mb-5.5 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-3 py-2 text-body-sm font-medium">SKU</th>
              <th className="px-3 py-2 text-body-sm font-medium">Taille</th>
              <th className="px-3 py-2 text-body-sm font-medium">Couleur</th>
              <th className="px-3 py-2 text-body-sm font-medium">Stock</th>
              <th className="px-3 py-2 text-body-sm font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr
                key={variant.id}
                className="border-b border-stroke last:border-0 dark:border-dark-3"
              >
                <td className="px-3 py-2">{variant.sku}</td>
                <td className="px-3 py-2">{variant.size ?? "—"}</td>
                <td className="px-3 py-2">{variant.color ?? "—"}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    defaultValue={variant.stock}
                    onBlur={(e) => handleStockChange(variant.id, e.target.value)}
                    className="w-20 rounded border border-stroke bg-transparent px-2 py-1 outline-none focus:border-primary dark:border-dark-3"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleDelete(variant.id)}
                    className="text-body-sm text-red hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}

            {variants.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucune variante. Ajoutez au moins une taille/couleur ci-dessous.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleAdd}
        className="grid grid-cols-2 gap-4 border-t border-stroke pt-5.5 dark:border-dark-3 sm:grid-cols-4"
      >
        <InputGroup
          label="SKU"
          name="sku"
          type="text"
          placeholder="ROB-001-M-NOIR"
          required
        />
        <InputGroup label="Taille" name="size" type="text" placeholder="M" />
        <InputGroup label="Couleur" name="color" type="text" placeholder="Noir" />
        <InputGroup
          label="Stock initial"
          name="stock"
          type="number"
          placeholder="0"
          defaultValue="0"
        />

        <button
          type="submit"
          disabled={adding}
          className="col-span-2 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-70 sm:col-span-4 sm:w-fit"
        >
          Ajouter la variante
        </button>
      </form>
    </ShowcaseSection>
  );
}
