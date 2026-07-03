"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type CategoryFormProps = {
  parentOptions: { value: string; label: string }[];
  initial?: {
    id: string;
    name: string;
    parentId: string | null;
  };
  canDelete?: boolean;
};

export function CategoryForm({
  parentOptions,
  initial,
  canDelete,
}: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      if (initial) {
        formData.set("id", initial.id);
        await notifyPromise(updateCategory(formData), {
          loading: "Mise à jour...",
          success: "Catégorie mise à jour",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      } else {
        await notifyPromise(createCategory(formData), {
          loading: "Création...",
          success: "Catégorie créée",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
      }
      router.push("/shop/categories");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Supprimer la catégorie "${initial.name}" ?`)) return;

    await notifyPromise(deleteCategory(initial.id), {
      loading: "Suppression...",
      success: "Catégorie supprimée",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.push("/shop/categories");
    router.refresh();
  }

  return (
    <ShowcaseSection
      title={initial ? "Modifier la catégorie" : "Nouvelle catégorie"}
      className="space-y-5.5 p-6.5!"
    >
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <InputGroup
          label="Nom"
          name="name"
          type="text"
          placeholder="Ex: Robes"
          defaultValue={initial?.name}
          required
        />

        <Select
          label="Catégorie parente (optionnel)"
          name="parentId"
          items={parentOptions}
          placeholder="Aucune"
          defaultValue={initial?.parentId ?? undefined}
        />

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
