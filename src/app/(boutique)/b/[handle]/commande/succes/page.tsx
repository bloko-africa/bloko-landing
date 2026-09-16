import { AccessForm } from "@/components/Auth/AccessForm";
import { PushNotificationsToggle } from "@/components/Admin/push-notifications-toggle";
import { DeliveryTimeline } from "@/components/Storefront/delivery-timeline";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import { claimGuestOrders } from "@/lib/orders/claim-guest-orders";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Commande confirmée" };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ order?: string; id?: string }>;
}) {
  const { handle } = await params;
  const { order: reference, id } = await searchParams;

  const session = await getCurrentSession();
  // Rattache d'abord toute commande invitée correspondant à cet email (celle-ci
  // comme les précédentes, toutes boutiques confondues) avant de relire la
  // commande — sinon l'affichage "isOwner" ci-dessous serait périmé d'un cycle.
  if (session?.user?.email) {
    await claimGuestOrders(session.user.id, session.user.email);
  }

  const order = id
    ? await db.order.findUnique({
        where: { id },
        select: {
          id: true,
          reference: true,
          userId: true,
          customerEmail: true,
          totalAmount: true,
          currency: true,
          status: true,
          livraison: { select: { status: true, trackingCode: true } },
        },
      })
    : null;

  const currentPath = `/b/${handle}/commande/succes?id=${id ?? ""}&order=${reference ?? ""}`;
  const isOwner = Boolean(session?.user && order?.userId === session.user.id);

  return (
    <div className="mx-auto max-w-(--breakpoint-sm) px-4 py-24 text-center">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Merci pour ta commande !
      </h1>
      <p className="mt-4 text-body-sm text-dark-5 dark:text-dark-6">
        Référence : {order?.reference ?? reference}.{" "}
        {order
          ? order.status === "PAID"
            ? "Ton paiement est confirmé."
            : "Ton paiement est en cours de confirmation — tu recevras une mise à jour dès qu'il sera validé."
          : "Ton paiement est en cours de confirmation."}
      </p>

      {order?.livraison && (
        <div className="mt-8 rounded-xl border border-stroke p-6 text-left dark:border-dark-3">
          <h2 className="mb-6 text-body-sm font-medium uppercase tracking-wide text-dark dark:text-white">
            Suivi de livraison
          </h2>
          <DeliveryTimeline
            status={order.livraison.status}
            trackingCode={order.livraison.trackingCode}
          />
        </div>
      )}

      {order && (
        <p className="mt-6 text-body-sm text-dark-5 dark:text-dark-6">
          Total : {formatPrice(Number(order.totalAmount), order.currency)}
        </p>
      )}

      {isOwner ? (
        <>
          <div className="mt-8 rounded-lg border border-stroke p-4 text-left dark:border-dark-3">
            <PushNotificationsToggle description="Active les notifications pour être prévenu(e) dès que le paiement est confirmé et à chaque étape de la livraison." />
          </div>
          <Link
            href={`/b/${handle}/compte`}
            className="mt-8 inline-block bg-dark px-8 py-3 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
          >
            Voir mes commandes
          </Link>
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-stroke p-6 text-left dark:border-dark-3">
          <p className="text-body-md font-medium text-dark dark:text-white">
            Suis ta commande facilement
          </p>
          <p className="mt-1 text-body-sm text-dark-5 dark:text-dark-6">
            Connecte-toi en un clic avec ton email — ça rattache aussi tes
            prochaines commandes, sur n&apos;importe quelle boutique Bloko.
          </p>
          <div className="mt-5">
            <Suspense>
              <AccessForm
                callbackURL={currentPath}
                defaultEmail={order?.customerEmail ?? ""}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
