import "server-only";
import { db } from "@/lib/db";

export type WalletSummary = {
  totalEarned: number;
  totalPaidOut: number;
  balance: number;
  currency: string;
};

/**
 * Solde jamais stocké tel quel — toujours recalculé à partir des commandes
 * PAID et des PayoutRecord existants. Règle d'intégrité : "gagné" = somme
 * des articles (OrderItem), PAS Order.totalAmount, qui peut inclure des
 * frais de livraison (mode INCLUS) qui ne reviennent pas à la vendeuse —
 * cet argent-là n'entre jamais dans son solde.
 */
export async function getWalletSummary(boutiqueId: string): Promise<WalletSummary> {
  const [boutique, paidOrders, payoutAgg] = await Promise.all([
    db.boutique.findUniqueOrThrow({
      where: { id: boutiqueId },
      select: { currency: true },
    }),
    db.order.findMany({
      where: { boutiqueId, status: "PAID" },
      select: { items: { select: { unitPrice: true, quantity: true } } },
    }),
    db.payoutRecord.aggregate({
      where: { boutiqueId },
      _sum: { amount: true },
    }),
  ]);

  const totalEarned = paidOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((s, item) => s + Number(item.unitPrice) * item.quantity, 0),
    0,
  );
  const totalPaidOut = Number(payoutAgg._sum.amount ?? 0);

  return {
    totalEarned,
    totalPaidOut,
    balance: totalEarned - totalPaidOut,
    currency: boutique.currency,
  };
}

/**
 * Version groupée pour une vue "toutes les boutiques" (ex: /wallet côté
 * admin) — évite d'appeler getWalletSummary() en boucle, ce qui ferait
 * jusqu'à 3 requêtes PAR boutique (N+1). Ici : 3 requêtes au total, quel
 * que soit le nombre de boutiques.
 */
export async function getWalletSummaries(
  boutiqueIds: string[],
): Promise<Map<string, WalletSummary>> {
  if (boutiqueIds.length === 0) return new Map();

  const [boutiques, paidOrders, payoutGroups] = await Promise.all([
    db.boutique.findMany({
      where: { id: { in: boutiqueIds } },
      select: { id: true, currency: true },
    }),
    db.order.findMany({
      where: { boutiqueId: { in: boutiqueIds }, status: "PAID" },
      select: {
        boutiqueId: true,
        items: { select: { unitPrice: true, quantity: true } },
      },
    }),
    db.payoutRecord.groupBy({
      by: ["boutiqueId"],
      where: { boutiqueId: { in: boutiqueIds } },
      _sum: { amount: true },
    }),
  ]);

  const earnedByBoutique = new Map<string, number>();
  for (const order of paidOrders) {
    const orderTotal = order.items.reduce(
      (s, item) => s + Number(item.unitPrice) * item.quantity,
      0,
    );
    earnedByBoutique.set(order.boutiqueId, (earnedByBoutique.get(order.boutiqueId) ?? 0) + orderTotal);
  }

  const paidOutByBoutique = new Map(
    payoutGroups.map((g) => [g.boutiqueId, Number(g._sum.amount ?? 0)]),
  );

  const result = new Map<string, WalletSummary>();
  for (const boutique of boutiques) {
    const totalEarned = earnedByBoutique.get(boutique.id) ?? 0;
    const totalPaidOut = paidOutByBoutique.get(boutique.id) ?? 0;
    result.set(boutique.id, {
      totalEarned,
      totalPaidOut,
      balance: totalEarned - totalPaidOut,
      currency: boutique.currency,
    });
  }
  return result;
}
