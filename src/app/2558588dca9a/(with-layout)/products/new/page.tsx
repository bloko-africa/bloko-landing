import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ProductForm } from "../_components/product-form";

export const metadata: Metadata = {
  title: "Nouveau produit",
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "editor",
    "admin",
    "vendeur",
  ]);

  const [boutiques, collections, categories] = await Promise.all([
    db.boutique.findMany({
      where: scopedBoutiqueId ? { id: scopedBoutiqueId } : undefined,
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    }),
    db.collection.findMany({
      where: { boutiqueId: scopedBoutiqueId },
      orderBy: { name: "asc" },
      include: { boutique: { select: { displayName: true } } },
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
        boutiques={boutiques.map((b) => ({ value: b.id, label: b.displayName }))}
        collections={collections.map((c) => ({
          value: c.id,
          // Non scopé (staff plateforme) : le nom de la boutique lève
          // l'ambiguïté entre collections homonymes de boutiques différentes.
          label: scopedBoutiqueId ? c.name : `${c.name} — ${c.boutique.displayName}`,
        }))}
        categories={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
    </div>
  );
}
