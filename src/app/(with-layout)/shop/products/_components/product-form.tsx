"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/actions/products";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "ARCHIVED", label: "Archivé" },
];

type ProductFormProps = {
  collections: { value: string; label: string }[];
  categories: { value: string; label: string }[];
  initial?: {
    id: string;
    name: string;
    description: string | null;
    basePrice: string;
    status: string;
    collectionId: string | null;
    categoryId: string | null;
  };
  canDelete?: boolean;
};

export function ProductForm({
  collections,
  categories,
  initial,
  canDelete,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      if (initial) {
        formData.set("id", initial.id);
        await notifyPromise(updateProduct(formData), {
          loading: "Mise à jour...",
          success: "Produit mis à jour",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
        router.refresh();
      } else {
        const id = await notifyPromise(createProduct(formData), {
          loading: "Création...",
          success: "Produit créé",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        });
        router.push(`/shop/products/${id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Supprimer le produit "${initial.name}" ?`)) return;

    await notifyPromise(deleteProduct(initial.id), {
      loading: "Suppression...",
      success: "Produit supprimé",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.push("/shop/products");
    router.refresh();
  }

  return (
    <ShowcaseSection
      title={initial ? "Informations produit" : "Nouveau produit"}
      className="space-y-5.5 p-6.5!"
    >
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <InputGroup
          label="Nom"
          name="name"
          type="text"
          placeholder="Ex: Robe portefeuille en soie"
          defaultValue={initial?.name}
          required
        />

        <TextAreaGroup
          label="Description"
          name="description"
          placeholder="Description du produit"
          defaultValue={initial?.description ?? undefined}
        />

        <InputGroup
          label="Prix de base (XOF)"
          name="basePrice"
          type="number"
          placeholder="Ex: 25000"
          defaultValue={initial?.basePrice}
          required
        />

        <Select
          label="Statut"
          name="status"
          items={STATUS_OPTIONS}
          defaultValue={initial?.status ?? "DRAFT"}
        />

        <Select
          label="Collection (optionnel)"
          name="collectionId"
          items={collections}
          placeholder="Aucune"
          defaultValue={initial?.collectionId ?? undefined}
        />

        <Select
          label="Catégorie (optionnel)"
          name="categoryId"
          items={categories}
          placeholder="Aucune"
          defaultValue={initial?.categoryId ?? undefined}
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
            {initial ? "Enregistrer" : "Créer et continuer"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
