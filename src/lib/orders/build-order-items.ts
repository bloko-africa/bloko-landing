import "server-only";
import { db } from "@/lib/db";
import { getBuyerPrice } from "@/lib/pricing";

export type OrderItemInput = { productVariantId: string; quantity: number };

/**
 * Libère la réservation de stock des commandes abandonnées : une Order
 * PENDING dont le dernier lien de paiement GeniusPay a expiré sans jamais
 * recevoir de webhook (client parti sans annuler). Lazy, pas de cron pour
 * le MVP — s'exécute à chaque tentative de réservation (voir
 * buildOrderItems). Pertinent en direct : sur un live TikTok, un panier
 * abandonné doit rendre son stock avant que d'autres acheteuses réservent.
 */
async function releaseExpiredReservations(): Promise<void> {
  // On checke l'expiration du DERNIER paiement de chaque commande, pas
  // "un paiement quelconque" — une commande admin relancée (generatePaymentLink
  // appelé plusieurs fois) a plusieurs Payment, et un ancien lien expiré ne
  // doit pas libérer le stock tant qu'un lien plus récent est encore valide.
  const pendingOrders = await db.order.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      items: { select: { productVariantId: true, quantity: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { expiresAt: true } },
    },
    take: 50,
  });

  const now = new Date();
  const staleOrders = pendingOrders.filter((order) => {
    const latestExpiry = order.payments[0]?.expiresAt;
    return latestExpiry != null && latestExpiry < now;
  });

  for (const order of staleOrders) {
    await db.$transaction(async (tx) => {
      // Revérifié dans la transaction : un webhook a pu traiter cette
      // commande entre le findMany ci-dessus et l'exécution de ce bloc.
      const current = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true },
      });
      if (current?.status !== "PENDING") return;

      await tx.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
  }
}

/**
 * Resolves order line items against live DB prices, puis RÉSERVE le stock
 * de façon atomique — un decrement conditionné (`stock >= quantity`) dans
 * la même requête SQL, pas une lecture suivie d'une écriture séparée.
 *
 * Nécessaire pour le cas d'usage confirmé : une vendeuse partage le lien de
 * sa boutique en plein live TikTok, plusieurs acheteuses lancent un
 * checkout sur le même variant à stock faible en quelques secondes. Un
 * simple `if (stock < quantity)` en lecture ne protège pas contre deux
 * commandes créées entre la lecture et l'écriture — l'`updateMany`
 * conditionnel ci-dessous si.
 *
 * Le stock réservé est libéré si le paiement échoue/expire/est annulé
 * (webhook GeniusPay, voir route.ts) — jamais au moment où il est payé
 * (contrairement à l'ancien `decrementStockForOrder`, qui décrémentait
 * seulement à la confirmation ; supprimé, cette fonction fait maintenant ce
 * travail dès la création de la commande).
 */
export async function buildOrderItems(items: OrderItemInput[]) {
  await releaseExpiredReservations();

  const variants = await db.productVariant.findMany({
    where: { id: { in: items.map((i) => i.productVariantId) } },
    include: {
      product: { select: { basePrice: true, name: true, boutiqueId: true } },
    },
  });

  // Vérifie l'existence + la contrainte mono-boutique AVANT de réserver quoi
  // que ce soit : sinon une réservation partielle resterait engagée si ce
  // check échouait après coup.
  const boutiqueIds = new Set<string>();
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.productVariantId);
    if (!variant) throw new Error("Variante introuvable.");
    boutiqueIds.add(variant.product.boutiqueId);
  }
  if (boutiqueIds.size > 1) {
    throw new Error("Le panier contient des articles de plusieurs boutiques différentes.");
  }
  const [boutiqueId] = boutiqueIds;

  const boutique = await db.boutique.findUniqueOrThrow({
    where: { id: boutiqueId },
    select: { passCommissionToClient: true },
  });

  type ItemData = {
    productVariantId: string;
    quantity: number;
    unitPrice: number;
  };

  // Transaction interactive : si un item échoue (stock insuffisant), les
  // decrements déjà appliqués sur les items précédents du même panier sont
  // annulés — pas de réservation partielle.
  const { itemsData, total } = await db.$transaction(async (tx) => {
    let runningTotal = 0;
    const data: ItemData[] = [];

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.productVariantId)!;

      const reserved = await tx.productVariant.updateMany({
        where: { id: item.productVariantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (reserved.count === 0) {
        const label = [variant.product.name, variant.size, variant.color]
          .filter(Boolean)
          .join(" ");
        throw new Error(
          `Stock insuffisant pour ${label} — il vient peut-être d'être vendu à l'instant.`,
        );
      }

      const listedPrice = Number(variant.priceOverride ?? variant.product.basePrice);
      const unitPrice = getBuyerPrice(listedPrice, boutique.passCommissionToClient);
      runningTotal += unitPrice * item.quantity;

      data.push({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    return { itemsData: data, total: runningTotal };
  });

  return { itemsData, total, boutiqueId };
}
