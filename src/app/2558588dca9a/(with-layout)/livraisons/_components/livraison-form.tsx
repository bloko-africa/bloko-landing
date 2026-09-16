"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Select } from "@/components/FormElements/select";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { updateLivraisonStatus } from "@/lib/actions/livraisons";
import { notifyPromise } from "@/lib/notify-promise";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, type ChangeEvent, type FormEvent } from "react";

const STATUS_OPTIONS = [
  { value: "A_ASSIGNER", label: "À assigner" },
  { value: "PRISE_EN_CHARGE", label: "Prise en charge" },
  { value: "EN_ROUTE", label: "En route" },
  { value: "LIVREE", label: "Livrée" },
  { value: "ECHEC", label: "Échec" },
  { value: "RETOUR", label: "Retour" },
];

type LivraisonFormProps = {
  livraisonId: string;
  agences: { value: string; label: string }[];
  initial: {
    agenceId: string | null;
    status: string;
    trackingCode: string | null;
    notes: string | null;
    proofUrl: string | null;
  };
};

export function LivraisonForm({ livraisonId, agences, initial }: LivraisonFormProps) {
  const router = useRouter();
  const proofInputId = useId();
  const [loading, setLoading] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(initial.proofUrl);

  function handleProofChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", livraisonId);
    setLoading(true);

    try {
      await notifyPromise(updateLivraisonStatus(formData), {
        loading: "Mise à jour...",
        success: "Livraison mise à jour",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection title="Suivi de livraison" className="space-y-5.5 p-6.5!">
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <Select
          label="Agence de livraison"
          name="agenceId"
          items={agences}
          placeholder="Aucune agence assignée"
          defaultValue={initial.agenceId ?? undefined}
        />
        <p className="-mt-3 text-body-xs text-dark-5 dark:text-dark-6">
          Les agences dont une zone correspond à la ville de la boutique
          apparaissent en premier — le choix reste manuel, aucune agence
          n&apos;est intégrée automatiquement pour l&apos;instant.
        </p>

        <Select
          label="Statut"
          name="status"
          items={STATUS_OPTIONS}
          defaultValue={initial.status}
        />

        <InputGroup
          label="Code de suivi (optionnel)"
          name="trackingCode"
          type="text"
          placeholder="Référence donnée par l'agence"
          defaultValue={initial.trackingCode ?? undefined}
        />

        <TextAreaGroup
          label="Notes (optionnel)"
          name="notes"
          placeholder="Ce que l'agence a rapporté par téléphone/WhatsApp"
          defaultValue={initial.notes ?? undefined}
        />

        <div className="space-y-3">
          <label className="block text-body-sm font-medium text-dark dark:text-white">
            Preuve de livraison (photo, optionnel)
          </label>
          <div className="flex items-center gap-4">
            {proofPreview && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stroke dark:border-dark-3">
                <Image src={proofPreview} alt="" fill className="object-cover" sizes="80px" />
              </div>
            )}
            <label
              htmlFor={proofInputId}
              className="cursor-pointer rounded-lg border border-stroke px-4 py-2.5 text-body-sm font-medium text-dark hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
            >
              {proofPreview ? "Remplacer la photo" : "Ajouter une photo"}
              <input
                id={proofInputId}
                name="proof"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleProofChange}
                className="sr-only"
              />
            </label>
          </div>
          <p className="text-body-xs text-dark-5 dark:text-dark-6">
            Photo du colis remis ou du reçu, transmise par l&apos;agence.
          </p>
        </div>

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
