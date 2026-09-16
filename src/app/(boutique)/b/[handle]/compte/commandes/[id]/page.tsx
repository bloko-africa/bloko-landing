import { getCurrentSession } from "@/lib/auth/session";
import { getCountryName, getFlagEmoji } from "@/lib/countries";
import { db } from "@/lib/db";
import { claimGuestOrders } from "@/lib/orders/claim-guest-orders";
import { formatPrice } from "@/lib/format-price";
import { DeliveryTimeline } from "@/components/Storefront/delivery-timeline";
import { ReviewForm, StarDisplay } from "@/components/Storefront/review-form";
import { TicketForm } from "@/components/Storefront/ticket-form";
import {
  SUPPORT_TICKET_STATUS_LABEL,
  SUPPORT_TICKET_STATUS_STYLE,
} from "@/lib/support-ticket-status";
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
  params: Promise<{ handle: string; id: string }>;
}) {
  const { handle, id } = await params;
  const session = await getCurrentSession();
  const user = session!.user;

  if (user.email) {
    await claimGuestOrders(user.id, user.email);
  }

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
      livraison: { select: { status: true, trackingCode: true } },
      review: { select: { rating: true, comment: true } },
      supportTicket: { select: { id: true, subject: true, status: true } },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <Link
        href={`/b/${handle}/compte`}
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

      <div className="mt-6 flex flex-col items-end gap-1">
        <p className="text-body-lg font-semibold text-dark dark:text-white">
          Total : {formatPrice(Number(order.totalAmount), order.currency)}
        </p>
        {order.deliveryFeeMode === "A_LA_CHARGE_DU_CLIENT" && Number(order.deliveryFee) > 0 && (
          <p className="text-body-sm text-dark-5 dark:text-dark-6">
            + {formatPrice(Number(order.deliveryFee), order.currency)} de livraison, à payer à la réception
          </p>
        )}
        {order.deliveryFeeMode === "A_LA_CHARGE_DU_CLIENT" && Number(order.deliveryFee) === 0 && (
          <p className="text-body-sm text-dark-5 dark:text-dark-6">
            Livraison à négocier directement avec le livreur
          </p>
        )}
        {order.deliveryFeeMode === "INCLUS" && Number(order.deliveryFee) > 0 && (
          <p className="text-body-sm text-dark-5 dark:text-dark-6">
            Dont {formatPrice(Number(order.deliveryFee), order.currency)} de livraison, déjà réglés
          </p>
        )}
      </div>

      {order.livraison && (
        <div className="mt-10 rounded-xl border border-stroke p-6 dark:border-dark-3">
          <h2 className="mb-6 text-body-sm font-medium uppercase tracking-wide text-dark dark:text-white">
            Suivi de livraison
          </h2>
          <DeliveryTimeline status={order.livraison.status} trackingCode={order.livraison.trackingCode} />
        </div>
      )}

      {order.livraison?.status === "LIVREE" && (
        <div className="mt-6">
          {order.review ? (
            <div className="rounded-xl border border-stroke p-6 dark:border-dark-3">
              <p className="mb-2 text-body-sm font-medium text-dark dark:text-white">
                Ton avis
              </p>
              <StarDisplay rating={order.review.rating} />
              {order.review.comment && (
                <p className="mt-3 text-body-sm text-dark-5 dark:text-dark-6">
                  {order.review.comment}
                </p>
              )}
            </div>
          ) : (
            <ReviewForm orderId={order.id} />
          )}
        </div>
      )}

      <div className="mt-6">
        {order.supportTicket ? (
          <Link
            href={`/compte/tickets/${order.supportTicket.id}`}
            className="flex items-center justify-between rounded-xl border border-stroke p-6 hover:border-primary dark:border-dark-3"
          >
            <div>
              <p className="text-body-sm font-medium text-dark dark:text-white">
                {order.supportTicket.subject}
              </p>
              <p className="text-body-xs text-dark-5 dark:text-dark-6">Voir la conversation</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-body-xs font-medium ${SUPPORT_TICKET_STATUS_STYLE[order.supportTicket.status] ?? ""}`}
            >
              {SUPPORT_TICKET_STATUS_LABEL[order.supportTicket.status] ?? order.supportTicket.status}
            </span>
          </Link>
        ) : (
          <TicketForm orderId={order.id} />
        )}
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
