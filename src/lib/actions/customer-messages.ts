"use server";

import { db } from "@/lib/db";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { BroadcastEmail } from "@/lib/email/templates/broadcast";
import { render } from "@react-email/render";
import { z } from "zod";

const sendSchema = z.object({
  boutiqueId: z.string().min(1),
  subject: z.string().min(1, "Objet requis"),
  message: z.string().min(1, "Message requis").max(4000),
});

/**
 * Destinataires : emails distincts des acheteurs ayant une commande PAID
 * sur cette boutique — pas une liste d'abonnés à part, on réutilise les
 * clients réels. Un acheteur sans email (commande passée sans compte) est
 * simplement ignoré.
 */
export async function getCustomerEmailCount(boutiqueId: string): Promise<number> {
  const emails = await db.order.findMany({
    where: { boutiqueId, status: "PAID", customerEmail: { not: null } },
    distinct: ["customerEmail"],
    select: { customerEmail: true },
  });
  return emails.length;
}

export async function sendCustomerMessage(formData: FormData) {
  const boutiqueId = formData.get("boutiqueId")?.toString() ?? "";
  await requireBoutiqueAccess(["admin", "vendeur"], boutiqueId);

  const data = sendSchema.parse({
    boutiqueId,
    subject: formData.get("subject")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
  });

  const [boutique, orders] = await Promise.all([
    db.boutique.findUniqueOrThrow({
      where: { id: data.boutiqueId },
      select: { displayName: true },
    }),
    db.order.findMany({
      where: { boutiqueId: data.boutiqueId, status: "PAID", customerEmail: { not: null } },
      distinct: ["customerEmail"],
      select: { customerEmail: true },
    }),
  ]);

  const html = await render(
    BroadcastEmail({
      boutiqueName: boutique.displayName,
      subject: data.subject,
      message: data.message,
    }),
  );

  let sent = 0;
  for (const order of orders) {
    if (!order.customerEmail) continue;
    await sendEmail({
      to: order.customerEmail,
      subject: data.subject,
      category: "commande",
      html,
    });
    sent += 1;
  }

  return { sent };
}
