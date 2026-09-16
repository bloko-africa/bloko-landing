import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildLedgerCsv, type LedgerRow } from "@/lib/export/order-ledger-csv";
import { NextRequest, NextResponse } from "next/server";

const DELIVERY_STATUS_LABEL: Record<string, string> = {
  A_ASSIGNER: "À assigner",
  PRISE_EN_CHARGE: "Prise en charge",
  EN_ROUTE: "En route",
  LIVREE: "Livrée",
  ECHEC: "Échec",
  RETOUR: "Retour",
};

/**
 * Export "grand livre" par boutique — pour Solda, export seul (pas
 * d'ingestion : Solda n'a aujourd'hui aucun schéma produit pour recevoir
 * cette donnée). Une ligne par article de commande, colonnes volontairement
 * plates pour rester exploitables sans présupposer le schéma en face.
 *
 * Sous /2558588dca9a/api (pas /api) pour hériter du gating proxy.ts — la vraie
 * barrière reste le requireBoutiqueAccess ci-dessous.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await requireBoutiqueAccess(["admin", "vendeur"], id);
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const boutique = await db.boutique.findUnique({
    where: { id },
    select: { handle: true },
  });
  if (!boutique) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  const orders = await db.order.findMany({
    where: { boutiqueId: id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { productVariant: { include: { product: true } } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      livraison: { include: { agence: true } },
    },
  });

  const rows: LedgerRow[] = orders.flatMap((order) => {
    const payment = order.payments[0];
    return order.items.map((item): LedgerRow => ({
      orderReference: order.reference,
      orderDate: order.createdAt.toISOString().slice(0, 10),
      productName: item.productVariant.product.name,
      variant: [item.productVariant.size, item.productVariant.color]
        .filter(Boolean)
        .join(" / "),
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      orderTotal: Number(order.totalAmount),
      currency: order.currency,
      paymentStatus: payment?.status ?? "—",
      paymentMethod: payment?.paymentMethod ?? "—",
      deliveryStatus: order.livraison
        ? (DELIVERY_STATUS_LABEL[order.livraison.status] ?? order.livraison.status)
        : "—",
      agencyName: order.livraison?.agence?.name ?? "—",
      trackingCode: order.livraison?.trackingCode ?? "—",
    }));
  });

  const csv = buildLedgerCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="grand-livre-${boutique.handle}.csv"`,
    },
  });
}
