"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import {
  createGeniusPayPayment,
  getGeniusPayPaymentStatus,
} from "@/lib/payments/geniuspay";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createOrderSchema = z.object({
  customerName: z.string().min(1, "Nom requis"),
  customerPhone: z.string().min(6, "Téléphone requis"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  country: z.enum(["CI", "BJ"]),
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
  await requireRole(["editor", "admin"]);
  const data = createOrderSchema.parse(input);

  const variants = await db.productVariant.findMany({
    where: { id: { in: data.items.map((i) => i.productVariantId) } },
    include: { product: { select: { basePrice: true } } },
  });

  let total = 0;
  const itemsData = data.items.map((item) => {
    const variant = variants.find((v) => v.id === item.productVariantId);
    if (!variant) throw new Error("Variante introuvable");

    const unitPrice = variant.priceOverride ?? variant.product.basePrice;
    total += Number(unitPrice) * item.quantity;

    return {
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPrice,
    };
  });

  const order = await db.order.create({
    data: {
      reference: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      totalAmount: total,
      items: { create: itemsData },
    },
  });

  revalidatePath("/admin/orders");
  return order.id;
}

export async function generatePaymentLink(orderId: string, country: "CI" | "BJ") {
  await requireRole(["editor", "admin"]);

  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });

  const payment = await createGeniusPayPayment({
    amount: Number(order.totalAmount),
    currency: order.currency,
    description: `Commande ${order.reference}`,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail ?? undefined,
      country,
    },
    metadata: { orderId: order.id, orderReference: order.reference },
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

  revalidatePath(`/admin/orders/${orderId}`);
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
  await requireRole(["editor", "admin"]);

  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
  });
  const remote = await getGeniusPayPaymentStatus(payment.reference);
  const newStatus = STATUS_MAP[remote.status];

  await db.payment.update({
    where: { id: payment.id },
    data: { status: newStatus },
  });

  if (newStatus === "COMPLETED") {
    await db.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });
  }

  revalidatePath(`/admin/orders/${payment.orderId}`);
}
