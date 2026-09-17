"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { Switch } from "@/components/FormElements/switch";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/lib/actions/collections";
import { notifyPromise } from "@/lib/notify-promise";
import { useDashboardBase } from "@/lib/use-dashboard-base";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type CollectionFormProps = {
  // Absent en édition (boutiqueId immuable après création).
  boutiques?: { value: string; label: string }[];
  initial?: {
    id: string;
    name: string;
    season: string | null;
    description: string | null;
    isActive: boolean;
  };
  canDelete?: boolean;
};

export function CollectionForm({ boutiques, initial, canDelete }: CollectionFormProps) {
  const router = useRouter();
  const dashboardBase = useDashboardBase();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      if (initial) {
        formData.set("id", initial.id);
        await notifyPromise(updateCollection(formData), {
          loading: "Mise à jour...",
          success: "Collection mise à jour",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      } else {
        await notifyPromise(createCollection(formData), {
          loading: "Création...",
          success: "Collection créée",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      }
      router.push(`${dashboardBase}/collections`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Supprimer la collection "${initial.name}" ?`)) return;

    await notifyPromise(deleteCollection(initial.id), {
      loading: "Suppression...",
      success: "Collection supprimée",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.push(`${dashboardBase}/collections`);
    router.refresh();
  }

  return (
    <ShowcaseSection
      title={initial ? "Modifier la collection" : "Nouvelle collection"}
      className="space-y-5.5 p-6.5!"
    >
      <form onSubmit={handleSubmit} className="space-y-5.5">
        {boutiques && (
          <Select
            label="Boutique"
            name="boutiqueId"
            items={boutiques}
            placeholder="Choisir une boutique"
            defaultValue={boutiques.length === 1 ? boutiques[0].value : undefined}
          />
        )}

        <InputGroup
          label="Nom"
          name="name"
          type="text"
          placeholder="Ex: Prêt-à-porter Été"
          defaultValue={initial?.name}
          required
        />

        <InputGroup
          label="Saison"
          name="season"
          type="text"
          placeholder="Ex: Printemps-Été 2027"
          defaultValue={initial?.season ?? undefined}
        />

        <TextAreaGroup
          label="Description"
          name="description"
          placeholder="Description de la collection"
          defaultValue={initial?.description ?? undefined}
        />

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

        <div className="flex justify-between gap-3">
          {canDelete && initial && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex justify-center rounded-lg border border-red px-6 py-1.75 font-medium text-red hover:bg-red hover:text-white"
            >
              Supprimer
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ml-auto flex justify-center rounded-lg bg-primary px-6 py-1.75 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
          >
            {initial ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
