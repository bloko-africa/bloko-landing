"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { buildOrderItems } from "@/lib/orders/build-order-items";
import { createGeniusPayPayment } from "@/lib/payments/geniuspay";
import { formatPrice } from "@/lib/format-price";
import { notifyStaff } from "@/lib/push/send-push";
import { getStoreSettings } from "@/lib/store-settings";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8).optional(),
  customerName: z.string().min(1, "Nom requis"),
  customerPhone: z.string().min(6, "Téléphone requis"),
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

/**
 * Checkout sans exiger de session prealable :
 * - deja connecte -> commande liee au compte actif.
 * - email inconnu -> compte cree a la volee (mot de passe requis cote client).
 * - email deja utilise mais pas connecte -> commande "invitee" (pas de lien
 *   de compte, on ne verifie pas l'identite juste via l'email).
 */
export async function checkout(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);
  const { itemsData, total } = await buildOrderItems(data.items);
  const settings = await getStoreSettings();

  const session = await getCurrentSession();
  let userId: string | undefined = session?.user?.id;

  if (!userId) {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (!existingUser) {
      if (!data.password) {
        throw new Error("Choisis un mot de passe pour créer ton compte.");
      }
      const { user } = await auth.api.signUpEmail({
        body: { name: data.customerName, email: data.email, password: data.password },
      });
      userId = user.id;
    }
    // existingUser trouve sans session active -> commande invitee (pas de userId)
  }

  const order = await db.order.create({
    data: {
      reference: `ORD-${Date.now().toString(36).toUpperCase()}`,
      userId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.email,
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
      email: data.email,
      country: data.country,
    },
    metadata: { orderId: order.id, orderReference: order.reference },
    // Paiement initie depuis le storefront -> on ramene le client sur le
    // detail de sa commande (son compte), pas sur une page generique.
    successUrl: `${appUrl}/compte/commandes/${order.id}?paiement=succes`,
    errorUrl: `${appUrl}/compte/commandes/${order.id}?paiement=erreur`,
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

  // Awaited (pas fire-and-forget) : sur une fonction serverless, le runtime
  // peut couper l'execution des qu'on retourne, un .catch() sans await ne
  // serait pas fiable pour garantir l'envoi.
  try {
    await notifyStaff({
      title: "Nouvelle commande",
      body: `${order.reference} — ${data.customerName} — ${formatPrice(total, settings.currency)}`,
      url: `/admin/orders/${order.id}`,
    });
  } catch (err) {
    console.error("Echec notification push:", err);
  }

  return { checkoutUrl: payment.checkout_url, orderReference: order.reference };
}
