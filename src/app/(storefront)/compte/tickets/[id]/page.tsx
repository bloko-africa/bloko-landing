import { TicketReplyForm } from "@/components/Storefront/ticket-reply-form";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  SUPPORT_TICKET_STATUS_LABEL,
  SUPPORT_TICKET_STATUS_STYLE,
} from "@/lib/support-ticket-status";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Ticket SAV" };
export const dynamic = "force-dynamic";

export default async function TicketThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentSession();
  const user = session!.user;

  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      order: {
        select: { reference: true, boutique: { select: { displayName: true } } },
      },
    },
  });

  if (!ticket || ticket.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-(--breakpoint-sm) px-4 py-16">
      <Link
        href="/compte"
        className="text-body-sm font-medium uppercase tracking-wide text-dark-5 hover:text-primary dark:text-dark-6"
      >
        ← Mon compte
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
            {ticket.subject}
          </h1>
          <p className="mt-1 text-body-sm text-dark-5 dark:text-dark-6">
            {ticket.order.boutique.displayName} — Commande {ticket.order.reference}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-body-xs font-medium ${SUPPORT_TICKET_STATUS_STYLE[ticket.status] ?? ""}`}
        >
          {SUPPORT_TICKET_STATUS_LABEL[ticket.status] ?? ticket.status}
        </span>
      </div>

      <div className="mt-8 space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg border p-4 text-body-sm ${
              message.isStaff
                ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                : "border-stroke dark:border-dark-3"
            }`}
          >
            <p className="mb-1 text-body-xs font-medium uppercase tracking-wide text-dark-5 dark:text-dark-6">
              {message.isStaff ? ticket.order.boutique.displayName : "Toi"} —{" "}
              {message.createdAt.toLocaleString("fr-FR")}
            </p>
            <p className="text-dark dark:text-white">{message.body}</p>
          </div>
        ))}
      </div>

      {ticket.status === "FERME" ? (
        <p className="mt-6 text-body-sm text-dark-5 dark:text-dark-6">Ce ticket est fermé.</p>
      ) : (
        <TicketReplyForm ticketId={ticket.id} />
      )}
    </div>
  );
}
