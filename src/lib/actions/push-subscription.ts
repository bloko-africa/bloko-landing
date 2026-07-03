"use server";

import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { z } from "zod";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function subscribeToPush(input: unknown) {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Non connecté.");

  const data = subscribeSchema.parse(input);

  await db.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    create: {
      userId: session.user.id,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
    },
    update: { userId: session.user.id },
  });
}

export async function unsubscribeFromPush(endpoint: string) {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Non connecté.");

  await db.pushSubscription
    .delete({ where: { endpoint } })
    .catch(() => {});
}
