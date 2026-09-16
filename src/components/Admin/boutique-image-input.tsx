"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";

type BoutiqueImageInputProps = {
  name: "logo" | "cover";
  label: string;
  currentUrl?: string | null;
  aspect?: "square" | "wide";
};

/**
 * Champ fichier simple pour le branding boutique (logo/couverture) : preview
 * locale immédiate, l'upload réel se fait côté serveur au submit du
 * formulaire parent (createBoutique/updateBoutique lisent ce champ dans le
 * FormData) — contrairement aux photos produit qui s'uploadent à la volée,
 * ici il n'y a qu'une image à la fois donc pas besoin d'un flux séparé.
 */
export function BoutiqueImageInput({
  name,
  label,
  currentUrl,
  aspect = "square",
}: BoutiqueImageInputProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-3">
      <label className="block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div
          className={
            aspect === "square"
              ? "relative size-20 shrink-0 overflow-hidden rounded-full bg-gray-2 dark:bg-dark-3"
              : "relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-2 dark:bg-dark-3"
          }
        >
          {preview && (
            <Image src={preview} alt="" fill className="object-cover" sizes="144px" />
          )}
        </div>
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-lg border border-stroke px-4 py-2.5 text-body-sm font-medium text-dark hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Choisir une image
          <input
            id={inputId}
            name={name}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}
