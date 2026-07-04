import { getCurrentSession } from "@/lib/auth/session";
import { getCountryName, getFlagEmoji } from "@/lib/countries";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Détail de la commande" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  FAILED: "Échec du paiement",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentSession();
  const user = session!.user;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
          },
        },
      },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <Link
        href="/compte"
        className="text-body-sm font-medium uppercase tracking-wide text-dark-5 hover:text-primary dark:text-dark-6"
      >
        ← Mon compte
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
            Commande {order.reference}
          </h1>
          <p className="mt-1 text-body-sm text-dark-5 dark:text-dark-6">
            Passée le{" "}
            {order.createdAt.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="rounded-full bg-gray-2 px-3 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-2 dark:text-dark-6">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="mt-8 divide-y divide-stroke border-y border-stroke dark:divide-dark-3 dark:border-dark-3">
        {order.items.map((item) => {
          const image = item.productVariant.product.images[0]?.url;
          const variantLabel = [item.productVariant.size, item.productVariant.color]
            .filter(Boolean)
            .join(" / ");

          return (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-2 dark:bg-dark-2">
                {image && (
                  <Image src={image} alt="" fill className="object-cover" sizes="64px" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark dark:text-white">
                  {item.productVariant.product.name}
                </p>
                {variantLabel && (
                  <p className="text-body-sm text-dark-5 dark:text-dark-6">
                    {variantLabel}
                  </p>
                )}
                <p className="text-body-sm text-dark-5 dark:text-dark-6">
                  Qté {item.quantity}
                </p>
              </div>
              <p className="font-medium text-dark dark:text-white">
                {formatPrice(Number(item.unitPrice) * item.quantity, order.currency)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <p className="text-body-lg font-semibold text-dark dark:text-white">
          Total : {formatPrice(Number(order.totalAmount), order.currency)}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-body-sm font-medium uppercase tracking-wide text-dark dark:text-white">
            Livraison
          </h2>
          <p className="mt-2 text-body-sm text-dark-5 dark:text-dark-6">
            {order.customerName}
            <br />
            {order.customerPhone}
            <br />
            {getFlagEmoji(order.country)} {getCountryName(order.country)}
          </p>
        </div>
        <div>
          <h2 className="text-body-sm font-medium uppercase tracking-wide text-dark dark:text-white">
            Contact
          </h2>
          <p className="mt-2 text-body-sm text-dark-5 dark:text-dark-6">
            {order.customerEmail ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
