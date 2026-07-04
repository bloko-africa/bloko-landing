import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";
import Link from "next/link";
import { OrdersWorldMap } from "./_components/orders-world-map-client";
import { StatCard } from "./_components/stat-card";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-light-4 text-yellow-dark-2",
  PAID: "bg-green-light-6 text-green-dark",
  FAILED: "bg-red-light-5 text-red-dark",
  CANCELLED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
  REFUNDED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
};

export default async function AdminHome() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    settings,
    revenueThisMonth,
    pendingCount,
    totalOrdersCount,
    publishedProductsCount,
    lowStockVariants,
    recentOrders,
    ordersByCountry,
  ] = await Promise.all([
    getStoreSettings(),
    db.order.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
    }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.productVariant.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 6,
      include: { product: { select: { name: true, id: true } } },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.order.groupBy({
      by: ["country"],
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
    }),
  ]);

  const countryStats = ordersByCountry.map((row) => ({
    code: row.country,
    count: row._count.country,
  }));

  return (
    <>
      <Breadcrumb pageName="Tableau de bord" />

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires (mois en cours)"
          value={formatPrice(
            Number(revenueThisMonth._sum.totalAmount ?? 0),
            settings.currency,
          )}
          hint="Commandes payées uniquement"
          icon={<CashIcon />}
        />
        <StatCard
          label="Commandes en attente"
          value={String(pendingCount)}
          hint="Paiement non confirmé"
          icon={<ClockIcon />}
        />
        <StatCard
          label="Commandes totales"
          value={String(totalOrdersCount)}
          hint="Depuis l'ouverture"
          icon={<ListIcon />}
        />
        <StatCard
          label="Produits publiés"
          value={String(publishedProductsCount)}
          hint="Visibles sur la boutique"
          icon={<TagIcon />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <ShowcaseSection
          title="Commandes récentes"
          className="p-0! xl:col-span-3"
        >
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-stroke text-left dark:border-dark-3">
                <th className="px-5.5 py-3 text-body-sm font-medium">
                  Référence
                </th>
                <th className="px-5.5 py-3 text-body-sm font-medium">Client</th>
                <th className="px-5.5 py-3 text-body-sm font-medium">Total</th>
                <th className="px-5.5 py-3 text-body-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-stroke last:border-0 dark:border-dark-3"
                >
                  <td className="px-5.5 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-dark hover:text-primary dark:text-white"
                    >
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-5.5 py-3 text-body-sm text-dark-5 dark:text-dark-6">
                    {order.customerName}
                  </td>
                  <td className="px-5.5 py-3 text-body-sm text-dark-5 dark:text-dark-6">
                    {formatPrice(Number(order.totalAmount), order.currency)}
                  </td>
                  <td className="px-5.5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-body-xs font-medium ${ORDER_STATUS_STYLE[order.status] ?? ""}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}

              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5.5 py-8 text-center text-body-sm text-dark-5 dark:text-dark-6"
                  >
                    Aucune commande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ShowcaseSection>

        <ShowcaseSection
          title="Stock bas (≤ 5)"
          className="p-0! xl:col-span-2"
        >
          <ul className="divide-y divide-stroke dark:divide-dark-3">
            {lowStockVariants.map((variant) => (
              <li
                key={variant.id}
                className="flex items-center justify-between px-5.5 py-3"
              >
                <Link
                  href={`/admin/products/${variant.product.id}`}
                  className="text-body-sm font-medium text-dark hover:text-primary dark:text-white"
                >
                  {variant.product.name}
                  {[variant.size, variant.color].filter(Boolean).length > 0 && (
                    <span className="text-dark-5 dark:text-dark-6">
                      {" "}
                      ({[variant.size, variant.color].filter(Boolean).join(" / ")})
                    </span>
                  )}
                </Link>
                <span
                  className={
                    variant.stock === 0
                      ? "rounded-full bg-red-light-5 px-3 py-1 text-body-xs font-medium text-red-dark"
                      : "rounded-full bg-yellow-light-4 px-3 py-1 text-body-xs font-medium text-yellow-dark-2"
                  }
                >
                  {variant.stock} en stock
                </span>
              </li>
            ))}

            {lowStockVariants.length === 0 && (
              <li className="px-5.5 py-8 text-center text-body-sm text-dark-5 dark:text-dark-6">
                Aucune variante en stock bas.
              </li>
            )}
          </ul>
        </ShowcaseSection>
      </div>

      <div className="mt-6">
        <ShowcaseSection title="Commandes par pays" className="p-6.5!">
          <OrdersWorldMap stats={countryStats} />
        </ShowcaseSection>
      </div>
    </>
  );
}

function CashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 6v0M18 18v0" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 12.5 12.5 20a1.5 1.5 0 0 1-2.1 0L4 13.6a1.5 1.5 0 0 1 0-2.1L11.5 4H18a2 2 0 0 1 2 2v6.5Z" />
      <circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
