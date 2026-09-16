import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketReplyForm } from "../_components/ticket-reply-form";

export const metadata: Metadata = {
  title: "Détail ticket SAV",
};

export const dynamic = "force-dynamic";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      order: {
        select: {
          reference: true,
          boutique: { select: { displayName: true, ville: true } },
        },
      },
      user: { select: { name: true, email: true, phoneNumber: true } },
    },
  });

  if (!ticket) notFound();

  await requireBoutiqueAccess(["viewer", "editor", "admin", "vendeur"], ticket.boutiqueId);

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName={`Ticket SAV — ${ticket.order.reference}`} />

      <ShowcaseSection title="Commande" className="p-6.5!">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Boutique</p>
            <p className="font-medium text-dark dark:text-white">
              {ticket.order.boutique.displayName} ({ticket.order.boutique.ville})
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Client</p>
            <p className="font-medium text-dark dark:text-white">
              {ticket.user.name} — {ticket.user.email}
            </p>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={ticket.subject} className="space-y-4 p-6.5!">
        <div className="space-y-4">
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
                {message.isStaff ? "Staff" : ticket.user.name} —{" "}
                {message.createdAt.toLocaleString("fr-FR")}
              </p>
              <p className="text-dark dark:text-white">{message.body}</p>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      <TicketReplyForm ticketId={ticket.id} currentStatus={ticket.status} />
    </div>
  );
}
