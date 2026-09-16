import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
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

  await requireBoutiqueAccess(
    ["viewer", "editor", "admin", "vendeur"],
    collection.boutiqueId,
  );

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Modifier la collection" />
      <CollectionForm initial={collection} canDelete />
    </div>
  );
}
