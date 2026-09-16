"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { updateBoutiqueContact } from "@/lib/actions/boutiques";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ContactSavFormProps = {
  initial: {
    id: string;
    savPhone: string | null;
    socialWhatsapp: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTiktok: string | null;
    deliveryDetails: string | null;
  };
};

export function ContactSavForm({ initial }: ContactSavFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", initial.id);
    setLoading(true);

    try {
      await notifyPromise(updateBoutiqueContact(formData), {
        loading: "Enregistrement...",
        success: "Contact mis à jour",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection title="Mes coordonnées" className="space-y-5.5 p-6.5!">
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <TextAreaGroup
          label="Détails de livraison (affiché à la cliente)"
          name="deliveryDetails"
          placeholder="Ex: Je livre moi-même sur Cotonou et Abomey-Calavi sous 24h, 1000f. Ailleurs, on s'arrange par WhatsApp."
          defaultValue={initial.deliveryDetails ?? undefined}
        />
        <p className="-mt-3 text-body-xs text-dark-5 dark:text-dark-6">
          Explique en quelques mots comment tu livres et où — pas besoin de
          zone précise, la cliente paie la livraison directement avec toi si
          ton tarif n&apos;est pas inclus au paiement en ligne.
        </p>

        <InputGroup
          label="Numéro SAV (affiché aux clientes)"
          name="savPhone"
          type="tel"
          placeholder="Ex: +229 XX XX XX XX"
          defaultValue={initial.savPhone ?? undefined}
        />
        <InputGroup
          label="WhatsApp"
          name="socialWhatsapp"
          type="url"
          placeholder="https://wa.me/229..."
          defaultValue={initial.socialWhatsapp ?? undefined}
        />
        <InputGroup
          label="Facebook"
          name="socialFacebook"
          type="url"
          placeholder="https://facebook.com/..."
          defaultValue={initial.socialFacebook ?? undefined}
        />
        <InputGroup
          label="Instagram"
          name="socialInstagram"
          type="url"
          placeholder="https://instagram.com/..."
          defaultValue={initial.socialInstagram ?? undefined}
        />
        <InputGroup
          label="TikTok"
          name="socialTiktok"
          type="url"
          placeholder="https://tiktok.com/@..."
          defaultValue={initial.socialTiktok ?? undefined}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          Enregistrer
        </button>
      </form>
    </ShowcaseSection>
  );
}
