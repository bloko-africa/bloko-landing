import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { CategoryForm } from "../_components/category-form";

export const metadata: Metadata = {
  title: "Nouvelle catégorie",
};

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouvelle catégorie" />
      <CategoryForm
        parentOptions={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
    </div>
  );
}
