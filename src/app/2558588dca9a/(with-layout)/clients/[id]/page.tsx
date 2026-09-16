import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCustomerEmailCount } from "@/lib/actions/customer-messages";
import { CustomerMessageForm } from "../_components/customer-message-form";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Écrire aux clients" };
export const dynamic = "force-dynamic";

export default async function ClientsForBoutiquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireBoutiqueAccess(["admin", "vendeur"], id);

  const boutique = await db.boutique.findUnique({
    where: { id },
    select: { displayName: true },
  });
  if (!boutique) notFound();

  const recipientCount = await getCustomerEmailCount(id);

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName={`Clients — ${boutique.displayName}`} />
      <ShowcaseSection title="Écrire aux clients" className="p-6.5!">
        <CustomerMessageForm boutiqueId={id} recipientCount={recipientCount} />
      </ShowcaseSection>
    </div>
  );
}
