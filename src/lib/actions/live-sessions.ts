"use server";

import { db } from "@/lib/db";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const startLiveSessionSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1, "Sélectionne au moins un produit"),
});

export async function startLiveSession(formData: FormData) {
  const { session, scopedBoutiqueId } = await requireBoutiqueAccess([
    "admin",
    "editor",
    "vendeur",
  ]);
  if (!scopedBoutiqueId) {
    throw new Error("Cette action nécessite un compte rattaché à une boutique.");
  }

  const data = startLiveSessionSchema.parse({
    productIds: formData.getAll("productIds").map((v) => v.toString()),
  });

  const existing = await db.liveSession.findFirst({
    where: { boutiqueId: scopedBoutiqueId, status: "EN_COURS" },
    select: { id: true },
  });
  if (existing) {
    throw new Error("Un live est déjà en cours pour cette boutique.");
  }

  const liveSession = await db.liveSession.create({
    data: {
      boutiqueId: scopedBoutiqueId,
      startedById: session.user.id,
      products: { create: data.productIds.map((productId) => ({ productId })) },
    },
  });

  revalidatePath("/2558588dca9a/live");

  return { liveSessionId: liveSession.id };
}

export async function endLiveSession(formData: FormData) {
  const id = formData.get("id")?.toString() ?? "";
  const liveSession = await db.liveSession.findUniqueOrThrow({
    where: { id },
    select: { boutiqueId: true },
  });
  await requireBoutiqueAccess(["admin", "editor", "vendeur"], liveSession.boutiqueId);

  await db.liveSession.update({
    where: { id },
    data: { status: "TERMINE", endedAt: new Date() },
  });

  revalidatePath("/2558588dca9a/live");
  revalidatePath(`/2558588dca9a/live/${id}`);
}

export async function getLiveSessionFeed(liveSessionId: string) {
  const liveSession = await db.liveSession.findUniqueOrThrow({
    where: { id: liveSessionId },
    select: { boutiqueId: true, startedAt: true, status: true },
  });
  await requireBoutiqueAccess(["admin", "editor", "vendeur"], liveSession.boutiqueId);

  const orders = await db.order.findMany({
    where: { liveSessionId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reference: true,
      customerName: true,
      status: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });

  return {
    status: liveSession.status,
    elapsedSeconds: Math.floor((Date.now() - liveSession.startedAt.getTime()) / 1000),
    orders: orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    })),
  };
}
