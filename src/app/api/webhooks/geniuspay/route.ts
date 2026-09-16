import { db } from "@/lib/db";
import { verifyGeniusPayWebhook } from "@/lib/payments/verify-webhook";
import { notifyStaff, notifyUser } from "@/lib/push/send-push";
import { sendEmail } from "@/lib/email/send";
import { OrderConfirmedEmail } from "@/lib/email/templates/order-confirmed";
import { NewPaidOrderEmail } from "@/lib/email/templates/new-paid-order";
import { formatPrice } from "@/lib/format-price";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const webhookPayloadSchema = z.object({
  event: z.string().optional(),
  data: z.object({
    reference: z.string(),
    status: z.string().optional(),
  }),
});

const PAYMENT_EVENT_TO_STATUS: Record<
  string,
  { payment: "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED"; order: "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" }
> = {
  "payment.success": { payment: "COMPLETED", order: "PAID" },
  "payment.failed": { payment: "FAILED", order: "FAILED" },
  "payment.expired": { payment: "EXPIRED", order: "FAILED" },
  "payment.cancelled": { payment: "CANCELLED", order: "CANCELLED" },
  "payment.refunded": { payment: "REFUNDED", order: "REFUNDED" },
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const verification = verifyGeniusPayWebhook({
    rawBody,
    signature: request.headers.get("X-Webhook-Signature"),
    timestamp: request.headers.get("X-Webhook-Timestamp"),
  });

  if (!verification.valid) {
    console.error("Webhook GeniusPay rejeté:", verification.reason);
    return NextResponse.json({ error: verification.reason }, { status: 401 });
  }

  let payload: z.infer<typeof webhookPayloadSchema>;
  try {
    payload = webhookPayloadSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  const event = request.headers.get("X-Webhook-Event") ?? payload.event;
  const payment = await db.payment.findUnique({
    where: { reference: payload.data.reference },
    include: {
      order: {
        include: {
          items: true,
          boutique: {
            select: { handle: true, displayName: true, owner: { select: { email: true } } },
          },
        },
      },
    },
  });

  if (!payment) {
    // Idempotent : on répond 200 pour éviter que GeniusPay retente indéfiniment
    // un paiement qu'on ne connaît pas (ex: webhook de test).
    return NextResponse.json({ received: true, note: "reference inconnue" });
  }

  const mapping = event ? PAYMENT_EVENT_TO_STATUS[event] : undefined;
  const wasAlreadyPaid = payment.order.status === "PAID";
  const wasPending = payment.order.status === "PENDING";

  if (mapping) {
    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: { status: mapping.payment, rawPayload: JSON.parse(rawBody) },
      }),
      db.order.update({
        where: { id: payment.orderId },
        data: { status: mapping.order },
      }),
    ]);

    if (mapping.order === "PAID" && !wasAlreadyPaid) {
      // Le stock a déjà été réservé (décrémenté de façon atomique) à la
      // création de la commande — voir buildOrderItems(). Il ne reste ici
      // qu'à démarrer le suivi logistique : une Livraison en A_ASSIGNER dès
      // qu'une commande devient payée, pour qu'aucune vente ne reste sans
      // ligne de suivi. upsert = idempotent si ce webhook est rejoué.
      await db.livraison.upsert({
        where: { orderId: payment.orderId },
        create: { orderId: payment.orderId, status: "A_ASSIGNER" },
        update: {},
      });

      // Distinct de la notif "nouvelle commande" envoyée à la création
      // (checkout(), commande encore PENDING) : celle-ci confirme que
      // l'argent est réellement arrivé, ce qui justifie une alerte à part
      // pour la vendeuse (une commande PENDING peut ne jamais aboutir).
      await notifyStaff({
        title: "Commande payée",
        body: `${payment.order.reference} — ${formatPrice(Number(payment.order.totalAmount), payment.order.currency)}`,
        url: `/2558588dca9a/orders/${payment.orderId}`,
        boutiqueId: payment.order.boutiqueId,
      });

      const orderAmount = formatPrice(Number(payment.order.totalAmount), payment.order.currency);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      await sendEmail({
        to: payment.order.boutique.owner.email,
        subject: `Commande payée — ${payment.order.reference}`,
        category: "commande",
        html: await render(
          NewPaidOrderEmail({
            boutiqueName: payment.order.boutique.displayName,
            reference: payment.order.reference,
            amount: orderAmount,
            orderUrl: `${appUrl}/2558588dca9a/orders/${payment.orderId}`,
          }),
        ),
      });

      // La page de succès du paiement promet "tu recevras une mise à jour
      // dès qu'il sera validé" — sans ceci, cette promesse ne tenait pas.
      if (payment.order.userId) {
        await notifyUser(payment.order.userId, {
          title: "Paiement confirmé",
          body: `Ta commande ${payment.order.reference} est validée — suis sa livraison depuis ton compte.`,
          url: `/b/${payment.order.boutique.handle}/compte/commandes/${payment.orderId}`,
        });
      }

      if (payment.order.customerEmail) {
        await sendEmail({
          to: payment.order.customerEmail,
          subject: `Paiement confirmé — ${payment.order.reference}`,
          category: "commande",
          html: await render(
            OrderConfirmedEmail({
              customerName: payment.order.customerName,
              reference: payment.order.reference,
              amount: orderAmount,
              orderUrl: `${appUrl}/b/${payment.order.boutique.handle}/compte/commandes/${payment.orderId}`,
            }),
          ),
        });
      }
    }

    // Paiement échoué/expiré/annulé alors que la commande tenait encore une
    // réservation de stock (PENDING) : on la rend, sinon elle reste
    // verrouillée indéfiniment sur un panier qui n'aboutira jamais. Un
    // remboursement (REFUNDED, après PAID) ne touche pas le stock — c'est
    // une décision de retour séparée, hors scope ici.
    const releasesStock =
      wasPending && (mapping.order === "FAILED" || mapping.order === "CANCELLED");
    if (releasesStock) {
      await db.$transaction(
        payment.order.items.map((item) =>
          db.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );
    }
  } else {
    await db.payment.update({
      where: { id: payment.id },
      data: { rawPayload: JSON.parse(rawBody) },
    });
  }

  return NextResponse.json({ received: true });
}
