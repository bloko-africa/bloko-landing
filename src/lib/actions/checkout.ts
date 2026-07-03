"use server";

import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { buildOrderItems } from "@/lib/orders/build-order-items";
import { createGeniusPayPayment } from "@/lib/payments/geniuspay";
import { getStoreSettings } from "@/lib/store-settings";
import { z } from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Nom requis"),
  customerPhone: z.string().min(6, "Téléphone requis"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  country: z.string().length(2, "Pays requis"),
  items: z
    .array(
      z.object({
        productVariantId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "Le panier est vide"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function checkout(input: CheckoutInput) {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Tu dois être connecté pour passer commande.");
  }

  const data = checkoutSchema.parse(input);
  const { itemsData, total } = await buildOrderItems(data.items);
  const settings = await getStoreSettings();

  const order = await db.order.create({
    data: {
      reference: `ORD-${Date.now().toString(36).toUpperCase()}`,
      userId: session.user.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      country: data.country,
      totalAmount: total,
      currency: settings.currency,
      items: { create: itemsData },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const payment = await createGeniusPayPayment({
    amount: total,
    currency: settings.currency,
    description: `Commande ${order.reference}`,
    customer: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail || undefined,
      country: data.country,
    },
    metadata: { orderId: order.id, orderReference: order.reference },
    successUrl: `${appUrl}/commande/succes?order=${order.reference}`,
    errorUrl: `${appUrl}/commande/erreur?order=${order.reference}`,
  });

  await db.payment.create({
    data: {
      orderId: order.id,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      status: "PENDING",
      checkoutUrl: payment.checkout_url,
      expiresAt: payment.expires_at ? new Date(payment.expires_at) : null,
    },
  });

  return { checkoutUrl: payment.checkout_url, orderReference: order.reference };
}
