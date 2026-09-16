import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ContactSavForm } from "./_components/contact-sav-form";

export const metadata: Metadata = { title: "Contact, SAV & livraison" };
export const dynamic = "force-dynamic";

// Réservée à la vendeuse (requireBoutiqueAccess avec le seul rôle "vendeur"
// renvoie toujours son propre boutiqueId, pas de risque d'accès à une autre
// boutique) — le staff plateforme continue d'éditer ces mêmes champs depuis
// la fiche boutique complète (/2558588dca9a/boutiques/[id]).
export default async function ContactSavPage() {
  const { scopedBoutiqueId } = await requireBoutiqueAccess(["vendeur"]);

  const boutique = await db.boutique.findUniqueOrThrow({
    where: { id: scopedBoutiqueId },
    select: {
      id: true,
      savPhone: true,
      socialWhatsapp: true,
      socialFacebook: true,
      socialInstagram: true,
      socialTiktok: true,
      deliveryDetails: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Contact, SAV & livraison" />
      <ContactSavForm initial={boutique} />
    </div>
  );
}
