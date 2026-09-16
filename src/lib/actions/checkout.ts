"use server";

import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { buildOrderItems } from "@/lib/orders/build-order-items";
import { createGeniusPayPayment } from "@/lib/payments/geniuspay";
import { formatPrice } from "@/lib/format-price";
import { notifyStaff } from "@/lib/push/send-push";
import { z } from "zod";

const checkoutSchema = z.object({
  boutiqueHandle: z.string().min(1),
  email: z.string().email("Email invalide"),
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
 * Checkout sans exiger de session ni de mot de passe : connectee -> commande
 * liee au compte actif ; sinon commande "invitee" (userId null). Le compte
 * n'est jamais créé de force ici — l'acheteuse le récupère après paiement
 * via lien magique/code, qui rattache automatiquement cette commande (et
 * toute autre commande invitée avec le même email, toutes boutiques
 * confondues) une fois connectée. Voir claimGuestOrders().
 */
export async function checkout(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);

  // Résolu côté serveur (pas fait confiance au handle transmis tel quel) :
  // confirme que la boutique existe et est publique, et sert de référence
  // pour valider que les articles du panier lui appartiennent bien.
  const boutique = await db.boutique.findFirst({
    where: { handle: data.boutiqueHandle, status: "ACTIVE" },
    select: {
      id: true,
      handle: true,
      currency: true,
      deliveryFee: true,
      deliveryFeeMode: true,
    },
  });
  if (!boutique) throw new Error("Boutique introuvable.");

  const { itemsData, total, boutiqueId } = await buildOrderItems(data.items);
  if (boutiqueId !== boutique.id) {
    throw new Error("Les articles du panier n'appartiennent pas à cette boutique.");
  }

  // Snapshot des réglages boutique au moment de la commande : si la
  // vendeuse change son tarif plus tard, cette commande garde ce qui a été
  // annoncé à l'acheteur. Le montant payé en ligne (GeniusPay) n'inclut le
  // tarif que si le mode est INCLUS — sinon l'acheteur paiera en espèces
  // directement au livreur.
  const deliveryFee = Number(boutique.deliveryFee);
  const deliveryFeeMode = boutique.deliveryFeeMode;
  const amountToCharge = total + (deliveryFeeMode === "INCLUS" ? deliveryFee : 0);

  const session = await getCurrentSession();
  const userId: string | undefined = session?.user?.id;

  const order = await db.order.create({
    data: {
      boutiqueId: boutique.id,
      reference: `ORD-${Date.now().toString(36).toUpperCase()}`,
      userId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.email,
      country: data.country,
      totalAmount: amountToCharge,
      currency: boutique.currency,
      deliveryFee,
      deliveryFeeMode,
      items: { create: itemsData },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const boutiquePath = `${appUrl}/b/${boutique.handle}`;

  const payment = await createGeniusPayPayment({
    amount: amountToCharge,
    currency: boutique.currency,
    description: `Commande ${order.reference}`,
    customer: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.email,
      country: data.country,
    },
    metadata: { orderId: order.id, orderReference: order.reference },
    // Page de suivi publique (pas /compte/commandes/[id], qui exige une
    // session) : la majorité des acheteuses paient sans compte, il ne faut
    // pas les renvoyer vers un mur de connexion juste après avoir payé.
    successUrl: `${boutiquePath}/commande/succes?id=${order.id}&order=${order.reference}`,
    errorUrl: `${boutiquePath}/commande/erreur?id=${order.id}&order=${order.reference}`,
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
      body: `${order.reference} — ${data.customerName} — ${formatPrice(amountToCharge, boutique.currency)}`,
      url: `/2558588dca9a/orders/${order.id}`,
      boutiqueId: boutique.id,
    });
  } catch (err) {
    console.error("Echec notification push:", err);
  }

  return { checkoutUrl: payment.checkout_url, orderReference: order.reference };
}
