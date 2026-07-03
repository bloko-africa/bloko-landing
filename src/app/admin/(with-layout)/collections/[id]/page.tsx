import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionForm } from "../_components/collection-form";

export const metadata: Metadata = {
  title: "Modifier collection",
};

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await db.collection.findUnique({ where: { id } });

  if (!collection) notFound();

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Modifier la collection" />
      <CollectionForm initial={collection} canDelete />
    </div>
  );
}
