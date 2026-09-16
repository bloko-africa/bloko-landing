import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { CollectionForm } from "../_components/collection-form";

export const metadata: Metadata = {
  title: "Nouvelle collection",
};

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "editor",
    "admin",
    "vendeur",
  ]);

  const boutiques = await db.boutique.findMany({
    where: scopedBoutiqueId ? { id: scopedBoutiqueId } : undefined,
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true },
  });

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouvelle collection" />
      <CollectionForm
        boutiques={boutiques.map((b) => ({ value: b.id, label: b.displayName }))}
      />
    </div>
  );
}
