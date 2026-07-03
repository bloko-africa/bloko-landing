import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ProductForm } from "../_components/product-form";

export const metadata: Metadata = {
  title: "Nouveau produit",
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [collections, categories] = await Promise.all([
    db.collection.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouveau produit" />
      <ProductForm
        collections={collections.map((c) => ({ value: c.id, label: c.name }))}
        categories={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
    </div>
  );
}
