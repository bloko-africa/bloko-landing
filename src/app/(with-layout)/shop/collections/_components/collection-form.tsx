"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Switch } from "@/components/FormElements/switch";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/lib/actions/collections";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

type CollectionFormProps = {
  initial?: {
    id: string;
    name: string;
    season: string | null;
    description: string | null;
    isActive: boolean;
  };
  canDelete?: boolean;
};

export function CollectionForm({ initial, canDelete }: CollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      if (initial) {
        formData.set("id", initial.id);
        await toast.promise(updateCollection(formData), {
          loading: "Mise à jour...",
          success: "Collection mise à jour",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      } else {
        await toast.promise(createCollection(formData), {
          loading: "Création...",
          success: "Collection créée",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      }
      router.push("/shop/collections");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Supprimer la collection "${initial.name}" ?`)) return;

    await toast.promise(deleteCollection(initial.id), {
      loading: "Suppression...",
      success: "Collection supprimée",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.push("/shop/collections");
    router.refresh();
  }

  return (
    <ShowcaseSection
      title={initial ? "Modifier la collection" : "Nouvelle collection"}
      className="space-y-5.5 p-6.5!"
    >
      <form onSubmit={handleSubmit} className="space-y-5.5">
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
