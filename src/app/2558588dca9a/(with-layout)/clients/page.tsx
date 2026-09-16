import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { EmptyState } from "@/components/Admin/empty-state";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCustomerEmailCount } from "@/lib/actions/customer-messages";
import { CustomerMessageForm } from "./_components/customer-message-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess(["admin", "vendeur"]);

  if (scopedBoutiqueId) {
    const recipientCount = await getCustomerEmailCount(scopedBoutiqueId);
    return (
      <div className="mx-auto w-full max-w-180">
        <Breadcrumb pageName="Clients" />
        <ShowcaseSection title="Écrire à tes clients" className="p-6.5!">
          <CustomerMessageForm boutiqueId={scopedBoutiqueId} recipientCount={recipientCount} />
        </ShowcaseSection>
      </div>
    );
  }

  // Staff plateforme : choisir une boutique avant de pouvoir écrire à ses
  // clients — pas d'envoi "toutes boutiques confondues" en v1, ça n'aurait
  // pas de sens pour l'acheteur de recevoir un message d'une boutique dont
  // il n'a jamais entendu parler.
  const boutiques = await db.boutique.findMany({
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true, handle: true },
  });

  return (
    <>
      <Breadcrumb pageName="Clients" />
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Boutique</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white"></th>
            </tr>
          </thead>
          <tbody>
            {boutiques.map((b) => (
              <tr key={b.id} className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2">
                <td className="px-5.5 py-4 font-medium text-dark dark:text-white">
                  {b.displayName}
                </td>
                <td className="px-5.5 py-4 text-right">
                  <Link
                    href={`/2558588dca9a/clients/${b.id}`}
                    className="text-body-sm font-medium text-primary hover:underline"
                  >
                    Écrire aux clients →
                  </Link>
                </td>
              </tr>
            ))}

            {boutiques.length === 0 && (
              <tr>
                <td colSpan={2}>
                  <EmptyState
                    title="Aucune boutique pour le moment"
                    hint="Une boutique apparaît ici dès qu'elle est créée — tu pourras alors écrire à ses clients qui ont déjà commandé."
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
