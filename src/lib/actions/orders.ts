"use server";

import { db } from "@/lib/db";
import { requireRole, requireBoutiqueAccess } from "@/lib/auth/session";
import {
  createGeniusPayPayment,
  getGeniusPayPaymentStatus,
} from "@/lib/payments/geniuspay";
import { buildOrderItems } from "@/lib/orders/build-order-items";
import { formatPrice } from "@/lib/format-price";
import { notifyStaff } from "@/lib/push/send-push";
import { revalidateDashboardPath } from "@/lib/dashboard-space-server";
import { z } from "zod";

const createOrderSchema = z.object({
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
    .min(1, "Au moins un article requis"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function createOrder(input: CreateOrderInput) {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "editor",
    "admin",
    "vendeur",
  ]);
  const data = createOrderSchema.parse(input);
  const { itemsData, total, boutiqueId } = await buildOrderItems(data.items);
  if (!boutiqueId) throw new Error("Impossible de déterminer la boutique de la commande.");
  if (scopedBoutiqueId && scopedBoutiqueId !== boutiqueId) {
    throw new Error("Ces articles n'appartiennent pas à ta boutique.");
  }

  // Devise de LA BOUTIQUE (pas un réglage plateforme global — chaque
  // boutique a la sienne depuis le passage multi-tenant).
  const boutique = await db.boutique.findUniqueOrThrow({
    where: { id: boutiqueId },
    select: { currency: true, deliveryFee: true, deliveryFeeMode: true },
  });
  const deliveryFee = Number(boutique.deliveryFee);
  const deliveryFeeMode = boutique.deliveryFeeMode;
  const amountToCharge = total + (deliveryFeeMode === "INCLUS" ? deliveryFee : 0);

  const order = await db.order.create({
    data: {
      boutiqueId,
      reference: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      country: data.country,
      totalAmount: amountToCharge,
      currency: boutique.currency,
      deliveryFee,
      deliveryFeeMode,
      items: { create: itemsData },
    },
  });

  try {
    await notifyStaff({
      title: "Nouvelle commande",
      body: `${order.reference} — ${data.customerName} — ${formatPrice(amountToCharge, boutique.currency)}`,
      url: `/2558588dca9a/orders/${order.id}`,
      boutiqueId,
    });
  } catch (err) {
    console.error("Echec notification push:", err);
  }

  revalidateDashboardPath("/orders");
  return order.id;
}

export async function deleteOrder(orderId: string) {
  await requireRole(["admin"]);
  await db.order.delete({ where: { id: orderId } });
  revalidateDashboardPath("/orders");
}

export async function generatePaymentLink(orderId: string) {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { boutique: { select: { handle: true } } },
  });
  await requireBoutiqueAccess(["editor", "admin", "vendeur"], order.boutiqueId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const boutiquePath = `${appUrl}/b/${order.boutique.handle}`;

  const payment = await createGeniusPayPayment({
    amount: Number(order.totalAmount),
    currency: order.currency,
    description: `Commande ${order.reference}`,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail ?? undefined,
      country: order.country,
    },
    metadata: { orderId: order.id, orderReference: order.reference },
    // Lien genere par un membre du staff (envoye par WhatsApp/SMS...) -> on
    // ramene le client sur la boutique publique, pas sur son compte (il n'a
    // pas forcement de session ni de compte lie a cette commande).
    successUrl: `${boutiquePath}/commande/succes?order=${order.reference}`,
    errorUrl: `${boutiquePath}/commande/erreur?order=${order.reference}`,
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

  revalidateDashboardPath(`/orders/${orderId}`);
  return payment.checkout_url;
}

const STATUS_MAP = {
  pending: "PENDING",
  processing: "PROCESSING",
  completed: "COMPLETED",
  failed: "FAILED",
  expired: "EXPIRED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
} as const;

export async function refreshPaymentStatus(paymentId: string) {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { order: true },
  });
  await requireBoutiqueAccess(
    ["editor", "admin", "vendeur"],
    payment.order.boutiqueId,
  );

  const remote = await getGeniusPayPaymentStatus(payment.reference);
  const newStatus = STATUS_MAP[remote.status];

  await db.payment.update({
    where: { id: payment.id },
    data: { status: newStatus },
  });

  if (newStatus === "COMPLETED" && payment.order.status !== "PAID") {
    // Le stock a déjà été réservé (décrémenté) à la création de la commande
    // — voir buildOrderItems() — donc rien à décrémenter ici.
    await db.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });
  }

  revalidateDashboardPath(`/orders/${payment.orderId}`);
}
