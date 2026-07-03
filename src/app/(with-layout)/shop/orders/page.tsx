import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Commandes",
};

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-light-4 text-yellow-dark-2",
  PAID: "bg-green-light-6 text-green-dark",
  FAILED: "bg-red-light-5 text-red-dark",
  CANCELLED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
  REFUNDED: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
};

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <Breadcrumb pageName="Commandes" />

      <div className="mb-5 flex justify-end">
        <Link
          href="/shop/orders/new"
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
        >
          Nouvelle commande
        </Link>
      </div>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Référence
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Client
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Total
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Statut
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-stroke last:border-0 dark:border-dark-3"
              >
                <td className="px-5.5 py-4">
                  <Link
                    href={`/shop/orders/${order.id}`}
                    className="font-medium text-dark hover:text-primary dark:text-white"
                  >
                    {order.reference}
                  </Link>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {order.customerName}
                  <br />
                  <span className="text-body-xs">{order.customerPhone}</span>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {Number(order.totalAmount).toLocaleString("fr-FR")} XOF
                </td>
                <td className="px-5.5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-body-xs font-medium ${STATUS_STYLE[order.status] ?? ""}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {order.createdAt.toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5.5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
