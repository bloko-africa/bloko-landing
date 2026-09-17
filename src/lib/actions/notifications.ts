"use server";

import { db } from "@/lib/db";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { getDashboardBase } from "@/lib/dashboard-space";
import { formatPrice } from "@/lib/format-price";

export type OrderNotification = {
  id: string;
  title: string;
  subTitle: string;
  href: string;
};

export async function getRecentOrderNotifications(): Promise<{
  notifications: OrderNotification[];
  recentCount: number;
}> {
  // Bug corrigé : cette requête n'était pas scopée par boutique — une
  // vendeuse aurait vu les commandes de toutes les autres boutiques (et le
  // rôle "vendeur" n'était même pas autorisé à charger cet écran).
  const { session, scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);
  const where = scopedBoutiqueId ? { boutiqueId: scopedBoutiqueId } : undefined;
  const dashboardBase = getDashboardBase((session.user as { role?: string }).role);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [orders, recentCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.order.count({ where: { ...where, createdAt: { gte: dayAgo } } }),
  ]);

  return {
    notifications: orders.map((order) => ({
      id: order.id,
      title: `Commande ${order.reference}`,
      subTitle: `${order.customerName} — ${formatPrice(Number(order.totalAmount), order.currency)}`,
      href: `${dashboardBase}/orders/${order.id}`,
    })),
    recentCount,
  };
}
