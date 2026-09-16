import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LivraisonForm } from "../_components/livraison-form";

export const metadata: Metadata = {
  title: "Détail livraison",
};

export const dynamic = "force-dynamic";

export default async function LivraisonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const livraison = await db.livraison.findUnique({
    where: { id },
    include: {
      order: {
        include: { boutique: { select: { displayName: true, ville: true } } },
      },
    },
  });

  if (!livraison) notFound();

  await requireBoutiqueAccess(
    ["viewer", "editor", "admin", "vendeur"],
    livraison.order.boutiqueId,
  );

  const agences = await db.agence.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Pré-tri par pertinence : une agence dont une zone contient la ville de
  // la boutique (ou l'inverse) remonte en premier — simple correspondance
  // texte, le choix final reste manuel.
  const ville = livraison.order.boutique.ville.toLowerCase();
  const sortedAgences = [...agences].sort((a, b) => {
    const aMatch = a.zones.some(
      (z) => z.toLowerCase().includes(ville) || ville.includes(z.toLowerCase()),
    );
    const bMatch = b.zones.some(
      (z) => z.toLowerCase().includes(ville) || ville.includes(z.toLowerCase()),
    );
    if (aMatch === bMatch) return a.name.localeCompare(b.name, "fr");
    return aMatch ? -1 : 1;
  });

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName={`Livraison — ${livraison.order.reference}`} />

      <ShowcaseSection title="Commande" className="p-6.5!">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              Boutique
            </p>
            <p className="font-medium text-dark dark:text-white">
              {livraison.order.boutique.displayName} ({livraison.order.boutique.ville})
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              Client
            </p>
            <p className="font-medium text-dark dark:text-white">
              {livraison.order.customerName} — {livraison.order.customerPhone}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Total</p>
            <p className="font-medium text-dark dark:text-white">
              {formatPrice(Number(livraison.order.totalAmount), livraison.order.currency)}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Pays</p>
            <p className="font-medium text-dark dark:text-white">
              {livraison.order.country}
            </p>
          </div>
        </div>
      </ShowcaseSection>

      <LivraisonForm
        livraisonId={livraison.id}
        agences={sortedAgences.map((a) => ({
          value: a.id,
          label: a.zones.length > 0 ? `${a.name} (${a.zones.join(", ")})` : a.name,
        }))}
        initial={{
          agenceId: livraison.agenceId,
          status: livraison.status,
          trackingCode: livraison.trackingCode,
          notes: livraison.notes,
          proofUrl: livraison.proofUrl,
        }}
      />
    </div>
  );
}
