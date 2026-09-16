"use server";

import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function createReview(formData: FormData) {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Connecte-toi pour laisser un avis.");

  const data = createReviewSchema.parse({
    orderId: formData.get("orderId")?.toString() ?? "",
    rating: formData.get("rating")?.toString() ?? "0",
    comment: formData.get("comment")?.toString() || undefined,
  });

  const order = await db.order.findUniqueOrThrow({
    where: { id: data.orderId },
    include: { livraison: { select: { status: true } }, review: { select: { id: true } } },
  });

  if (order.userId !== session.user.id) {
    throw new Error("Cette commande ne t'appartient pas.");
  }
  if (order.livraison?.status !== "LIVREE") {
    throw new Error("Tu ne peux laisser un avis qu'une fois la commande livrée.");
  }
  if (order.review) {
    throw new Error("Tu as déjà laissé un avis pour cette commande.");
  }

  await db.review.create({
    data: {
      orderId: order.id,
      boutiqueId: order.boutiqueId,
      userId: session.user.id,
      rating: data.rating,
      comment: data.comment,
    },
  });

  revalidatePath(`/b/${order.boutiqueId}`);
  const boutique = await db.boutique.findUnique({
    where: { id: order.boutiqueId },
    select: { handle: true },
  });
  if (boutique) {
    revalidatePath(`/b/${boutique.handle}`);
    revalidatePath(`/b/${boutique.handle}/compte/commandes/${order.id}`);
  }
  revalidatePath("/");
}
