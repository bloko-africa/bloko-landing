import { db } from "@/lib/db";
import { verifyGeniusPayWebhook } from "@/lib/payments/verify-webhook";
import { decrementStockForOrder } from "@/lib/orders/build-order-items";
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
    include: { order: true },
  });

  if (!payment) {
    // Idempotent : on répond 200 pour éviter que GeniusPay retente indéfiniment
    // un paiement qu'on ne connaît pas (ex: webhook de test).
    return NextResponse.json({ received: true, note: "reference inconnue" });
  }

  const mapping = event ? PAYMENT_EVENT_TO_STATUS[event] : undefined;
  const wasAlreadyPaid = payment.order.status === "PAID";

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
      await decrementStockForOrder(payment.orderId);
    }
  } else {
    await db.payment.update({
      where: { id: payment.id },
      data: { rawPayload: JSON.parse(rawBody) },
    });
  }

  return NextResponse.json({ received: true });
}
