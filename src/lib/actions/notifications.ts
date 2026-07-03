"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
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
  await requireRole(["viewer", "editor", "admin"]);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [orders, recentCount] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.order.count({ where: { createdAt: { gte: dayAgo } } }),
  ]);

  return {
    notifications: orders.map((order) => ({
      id: order.id,
      title: `Commande ${order.reference}`,
      subTitle: `${order.customerName} — ${formatPrice(Number(order.totalAmount), order.currency)}`,
      href: `/admin/orders/${order.id}`,
    })),
    recentCount,
  };
}
