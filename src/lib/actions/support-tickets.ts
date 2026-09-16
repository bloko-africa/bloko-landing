"use server";

import { db } from "@/lib/db";
import { getCurrentSession, requireBoutiqueAccess } from "@/lib/auth/session";
import { notifyStaff, notifyUser } from "@/lib/push/send-push";
import { sendEmail } from "@/lib/email/send";
import { SupportReplyEmail } from "@/lib/email/templates/support-reply";
import { render } from "@react-email/render";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const supportTicketStatusSchema = z.enum(["OUVERT", "EN_COURS", "RESOLU", "FERME"]);

const createTicketSchema = z.object({
  orderId: z.string().min(1),
  subject: z.string().min(1, "Sujet requis").max(200),
  body: z.string().min(1, "Message requis").max(2000),
});

export async function createTicket(formData: FormData) {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Connecte-toi pour ouvrir un ticket.");

  const data = createTicketSchema.parse({
    orderId: formData.get("orderId")?.toString() ?? "",
    subject: formData.get("subject")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
  });

  const order = await db.order.findUniqueOrThrow({
    where: { id: data.orderId },
    select: { id: true, boutiqueId: true, userId: true, reference: true },
  });

  if (order.userId !== session.user.id) {
    throw new Error("Cette commande ne t'appartient pas.");
  }

  const existing = await db.supportTicket.findUnique({ where: { orderId: order.id } });
  if (existing) {
    throw new Error("Un ticket existe déjà pour cette commande.");
  }

  const ticket = await db.supportTicket.create({
    data: {
      boutiqueId: order.boutiqueId,
      userId: session.user.id,
      orderId: order.id,
      subject: data.subject,
      messages: { create: { authorId: session.user.id, isStaff: false, body: data.body } },
    },
  });

  try {
    await notifyStaff({
      title: "Nouveau ticket SAV",
      body: `${order.reference} — ${data.subject}`,
      url: `/2558588dca9a/support/${ticket.id}`,
      boutiqueId: order.boutiqueId,
    });
  } catch (err) {
    console.error("Echec notification push:", err);
  }

  const boutique = await db.boutique.findUnique({
    where: { id: order.boutiqueId },
    select: { handle: true },
  });
  if (boutique) {
    revalidatePath(`/b/${boutique.handle}/compte/commandes/${order.id}`);
  }
  revalidatePath("/compte");

  return { ticketId: ticket.id };
}

const replyToTicketSchema = z.object({
  id: z.string().min(1),
  status: supportTicketStatusSchema,
  body: z.string().max(2000).optional(),
});

export async function replyToTicket(formData: FormData) {
  const id = formData.get("id")?.toString() ?? "";
  const ticket = await db.supportTicket.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { email: true } },
      order: { select: { reference: true } },
    },
  });

  const { session } = await requireBoutiqueAccess(
    ["viewer", "editor", "admin", "vendeur"],
    ticket.boutiqueId,
  );

  const data = replyToTicketSchema.parse({
    id,
    status: formData.get("status")?.toString() ?? ticket.status,
    body: formData.get("body")?.toString() || undefined,
  });

  const hasNewMessage = Boolean(data.body);

  await db.supportTicket.update({
    where: { id },
    data: {
      status: data.status,
      ...(hasNewMessage
        ? {
            messages: {
              create: { authorId: session.user.id, isStaff: true, body: data.body! },
            },
          }
        : {}),
    },
  });

  const statusChanged = data.status !== ticket.status;
  if (hasNewMessage || statusChanged) {
    const ticketUrl = `/compte/tickets/${id}`;

    try {
      await notifyUser(ticket.userId, {
        title: "Réponse à ton ticket SAV",
        body: hasNewMessage ? data.body! : `Statut : ${data.status}`,
        url: ticketUrl,
      });
    } catch (err) {
      console.error("Echec notification push:", err);
    }

    if (ticket.user.email) {
      await sendEmail({
        to: ticket.user.email,
        subject: `Ticket SAV — ${ticket.order.reference}`,
        category: "support",
        html: await render(
          SupportReplyEmail({
            subject: ticket.subject,
            reference: ticket.order.reference,
            ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}${ticketUrl}`,
          }),
        ),
      });
    }
  }

  revalidatePath("/2558588dca9a/support");
  revalidatePath(`/2558588dca9a/support/${id}`);
}

const replyAsBuyerSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1, "Message requis").max(2000),
});

export async function replyToTicketAsBuyer(formData: FormData) {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("Connecte-toi pour répondre.");

  const data = replyAsBuyerSchema.parse({
    id: formData.get("id")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
  });

  const ticket = await db.supportTicket.findUniqueOrThrow({ where: { id: data.id } });
  if (ticket.userId !== session.user.id) {
    throw new Error("Ce ticket ne t'appartient pas.");
  }
  if (ticket.status === "FERME") {
    throw new Error("Ce ticket est fermé.");
  }

  await db.supportTicket.update({
    where: { id: data.id },
    data: {
      status: ticket.status === "RESOLU" ? "EN_COURS" : ticket.status,
      messages: {
        create: { authorId: session.user.id, isStaff: false, body: data.body },
      },
    },
  });

  try {
    await notifyStaff({
      title: "Nouveau message SAV",
      body: data.body,
      url: `/2558588dca9a/support/${ticket.id}`,
      boutiqueId: ticket.boutiqueId,
    });
  } catch (err) {
    console.error("Echec notification push:", err);
  }

  revalidatePath(`/compte/tickets/${data.id}`);
}

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: supportTicketStatusSchema,
});

export async function updateTicketStatus(formData: FormData) {
  const id = formData.get("id")?.toString() ?? "";
  const ticket = await db.supportTicket.findUniqueOrThrow({ where: { id } });
  await requireBoutiqueAccess(["viewer", "editor", "admin", "vendeur"], ticket.boutiqueId);

  const data = updateStatusSchema.parse({
    id,
    status: formData.get("status")?.toString() ?? ticket.status,
  });

  await db.supportTicket.update({ where: { id }, data: { status: data.status } });
  revalidatePath("/2558588dca9a/support");
}
