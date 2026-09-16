"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { Switch } from "@/components/FormElements/switch";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { createAgence, updateAgence } from "@/lib/actions/livraisons";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AgenceFormProps = {
  initial?: {
    id: string;
    name: string;
    phone: string | null;
    zones: string[];
    isActive: boolean;
  };
};

export function AgenceForm({ initial }: AgenceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      if (initial) {
        formData.set("id", initial.id);
        await notifyPromise(updateAgence(formData), {
          loading: "Mise à jour...",
          success: "Agence mise à jour",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      } else {
        await notifyPromise(createAgence(formData), {
          loading: "Création...",
          success: "Agence créée",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      }
      router.push("/2558588dca9a/agences");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection
      title={initial ? "Modifier l'agence" : "Nouvelle agence"}
      className="space-y-5.5 p-6.5!"
    >
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <InputGroup
          label="Nom"
          name="name"
          type="text"
          placeholder="Ex: RapidLivraison Cotonou"
          defaultValue={initial?.name}
          required
        />

        <InputGroup
          label="Téléphone (optionnel)"
          name="phone"
          type="tel"
          placeholder="Ex: +229 90 00 00 00"
          defaultValue={initial?.phone ?? undefined}
        />

        <InputGroup
          label="Zones desservies (séparées par une virgule)"
          name="zones"
          type="text"
          placeholder="Ex: Cotonou, Abomey-Calavi"
          defaultValue={initial?.zones.join(", ")}
        />
        <p className="-mt-3 text-body-xs text-dark-5 dark:text-dark-6">
          Sert à suggérer cette agence en premier pour les boutiques situées
          dans ces villes.
        </p>

        <div>
          <span className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Active
          </span>
          <Switch
            name="isActive"
            background="dark"
            defaultChecked={initial ? initial.isActive : true}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          {initial ? "Enregistrer" : "Créer"}
        </button>
      </form>
    </ShowcaseSection>
  );
}
