import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import { getCountryName, getFlagEmoji } from "@/lib/countries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderPayments } from "../_components/order-payments";

export const metadata: Metadata = {
  title: "Détail commande",
};

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { productVariant: { include: { product: true } } } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-270 space-y-8">
      <Breadcrumb pageName={order.reference} />

      <ShowcaseSection title="Client" className="p-6.5!">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Nom</p>
            <p className="font-medium text-dark dark:text-white">
              {order.customerName}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              Téléphone
            </p>
            <p className="font-medium text-dark dark:text-white">
              {order.customerPhone}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Email</p>
            <p className="font-medium text-dark dark:text-white">
              {order.customerEmail ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Pays</p>
            <p className="font-medium text-dark dark:text-white">
              {getFlagEmoji(order.country)} {getCountryName(order.country)}
            </p>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Articles" className="p-6.5!">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-3 py-2 text-body-sm font-medium">Produit</th>
              <th className="px-3 py-2 text-body-sm font-medium">Variante</th>
              <th className="px-3 py-2 text-body-sm font-medium">Qté</th>
              <th className="px-3 py-2 text-body-sm font-medium">
                Prix unitaire
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-stroke last:border-0 dark:border-dark-3"
              >
                <td className="px-3 py-2">{item.productVariant.product.name}</td>
                <td className="px-3 py-2">
                  {[item.productVariant.size, item.productVariant.color]
                    .filter(Boolean)
                    .join(" / ") || "—"}
                </td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">
                  {formatPrice(Number(item.unitPrice), order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-right text-lg font-semibold text-dark dark:text-white">
          Total : {formatPrice(Number(order.totalAmount), order.currency)}
        </p>
      </ShowcaseSection>

      <OrderPayments
        orderId={order.id}
        orderIsPaid={order.status === "PAID"}
        payments={order.payments.map((p) => ({
          id: p.id,
          reference: p.reference,
          status: p.status,
          amount: p.amount.toString(),
          currency: p.currency,
          checkoutUrl: p.checkoutUrl,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
