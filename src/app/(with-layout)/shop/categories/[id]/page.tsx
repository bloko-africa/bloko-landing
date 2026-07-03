import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "../_components/category-form";

export const metadata: Metadata = {
  title: "Modifier catégorie",
};

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({
      where: { id: { not: id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Modifier la catégorie" />
      <CategoryForm
        initial={category}
        parentOptions={categories.map((c) => ({ value: c.id, label: c.name }))}
        canDelete
      />
    </div>
  );
}
