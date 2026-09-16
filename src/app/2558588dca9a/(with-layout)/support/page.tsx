import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { EmptyState } from "@/components/Admin/empty-state";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { updateTicketStatus } from "@/lib/actions/support-tickets";
import { db } from "@/lib/db";
import {
  SUPPORT_TICKET_STATUS_LABEL as STATUS_LABEL,
  SUPPORT_TICKET_STATUS_STYLE as STATUS_STYLE,
} from "@/lib/support-ticket-status";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SAV",
};

export const dynamic = "force-dynamic";

export default async function SupportTicketsPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);

  const tickets = await db.supportTicket.findMany({
    where: scopedBoutiqueId ? { boutiqueId: scopedBoutiqueId } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      boutique: { select: { displayName: true } },
      order: { select: { reference: true } },
      user: { select: { name: true, email: true } },
    },
  });
  const showBoutiqueColumn = !scopedBoutiqueId;

  return (
    <>
      <Breadcrumb pageName="SAV" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Sujet
              </th>
              {showBoutiqueColumn && (
                <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                  Boutique
                </th>
              )}
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Commande
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Client
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Statut
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Mise à jour
              </th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                <td className="px-5.5 py-4 font-medium text-dark dark:text-white">
                  {ticket.subject}
                </td>
                {showBoutiqueColumn && (
                  <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                    {ticket.boutique.displayName}
                  </td>
                )}
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {ticket.order.reference}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {ticket.user.name}
                </td>
                <td className="px-5.5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-body-xs font-medium ${STATUS_STYLE[ticket.status] ?? ""}`}
                  >
                    {STATUS_LABEL[ticket.status] ?? ticket.status}
                  </span>
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {ticket.updatedAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5.5 py-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/2558588dca9a/support/${ticket.id}`}
                      className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                    >
                      Gérer
                    </Link>
                    {ticket.status !== "RESOLU" && ticket.status !== "FERME" && (
                      <form action={updateTicketStatus}>
                        <input type="hidden" name="id" value={ticket.id} />
                        <input type="hidden" name="status" value="RESOLU" />
                        <button
                          type="submit"
                          className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                        >
                          Marquer résolu
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {tickets.length === 0 && (
              <tr>
                <td colSpan={showBoutiqueColumn ? 7 : 6}>
                  <EmptyState
                    title="Aucun ticket pour le moment"
                    hint="Un ticket apparaît ici dès qu'une cliente en ouvre un depuis le détail de sa commande."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
