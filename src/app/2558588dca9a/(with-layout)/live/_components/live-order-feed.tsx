"use client";

import { getLiveSessionFeed } from "@/lib/actions/live-sessions";
import { formatPrice } from "@/lib/format-price";
import { useEffect, useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  FAILED: "Échec du paiement",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

type FeedOrder = {
  id: string;
  reference: string;
  customerName: string;
  status: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
};

export function LiveOrderFeed({
  liveSessionId,
  isEnded,
}: {
  liveSessionId: string;
  isEnded: boolean;
}) {
  const [orders, setOrders] = useState<FeedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const feed = await getLiveSessionFeed(liveSessionId);
        if (!cancelled) setOrders(feed.orders);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    if (isEnded) return;

    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveSessionId, isEnded]);

  if (loading) {
    return <p className="text-body-sm text-dark-5 dark:text-dark-6">Chargement...</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="text-body-sm text-dark-5 dark:text-dark-6">
        Aucune commande pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3"
        >
          <div>
            <p className="font-medium text-dark dark:text-white">{order.reference}</p>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              {order.customerName} — {order.itemCount} article(s)
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-dark dark:text-white">
              {formatPrice(order.totalAmount, order.currency)}
            </p>
            <p className="text-body-xs text-dark-5 dark:text-dark-6">
              {STATUS_LABEL[order.status] ?? order.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
