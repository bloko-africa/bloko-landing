import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import type { Metadata } from "next";
import { OrderForm } from "../_components/order-form";

export const metadata: Metadata = {
  title: "Nouvelle commande",
};

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "editor",
    "admin",
    "vendeur",
  ]);

  const variants = await db.productVariant.findMany({
    where: { product: { boutiqueId: scopedBoutiqueId } },
    include: {
      product: {
        select: {
          name: true,
          basePrice: true,
          boutique: { select: { displayName: true, currency: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Chaque variante porte la devise de SA boutique (settings global retiré,
  // chaque boutique a la sienne depuis le passage multi-tenant) : correct
  // même pour le staff plateforme qui voit toutes les boutiques à la fois.
  // buildOrderItems() refuse de toute façon un panier qui en mélange deux.
  const options = variants.map((v) => {
    const unitPrice = Number(v.priceOverride ?? v.product.basePrice);
    const attrs = [v.size, v.color].filter(Boolean).join(" / ");
    const boutiqueTag = scopedBoutiqueId ? "" : `[${v.product.boutique.displayName}] `;
    return {
      id: v.id,
      unitPrice,
      currency: v.product.boutique.currency,
      label: `${boutiqueTag}${v.product.name}${attrs ? ` — ${attrs}` : ""} (${formatPrice(unitPrice, v.product.boutique.currency)}, stock: ${v.stock})`,
    };
  });

  // Devise par défaut de l'écran (total avant sélection) : celle de la
  // première boutique listée — purement cosmétique, le total réel bascule
  // sur la devise de la variante choisie une fois qu'un article est ajouté.
  const defaultCurrency = options[0]?.currency ?? "XOF";

  return (
    <div className="mx-auto w-full max-w-270">
      <Breadcrumb pageName="Nouvelle commande" />
      <OrderForm variants={options} currency={defaultCurrency} />
    </div>
  );
}
