"use client";

import { UploadIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { addProductImage, deleteProductImageAction } from "@/lib/actions/products";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

type ProductImage = { id: string; url: string };

export function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      await toast.promise(addProductImage(productId, file), {
        loading: "Compression et upload...",
        success: "Image ajoutée",
        error: (err) => (err instanceof Error ? err.message : "Échec upload"),
      });
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Supprimer cette image ?")) return;

    await toast.promise(deleteProductImageAction(imageId), {
      loading: "Suppression...",
      success: "Image supprimée",
      error: (err) => (err instanceof Error ? err.message : "Échec"),
    });
    router.refresh();
  }

  return (
    <ShowcaseSection title="Photos produit" className="p-6.5!">
      <div className="mb-5.5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-stroke dark:border-dark-3"
          >
            <Image
              src={image.url}
              alt=""
              fill
              className="object-cover"
              sizes="200px"
            />
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-body-sm font-medium text-white opacity-0 transition group-hover:opacity-100"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="relative block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
        <input
          type="file"
          id={inputId}
          ref={inputRef}
          accept="image/png, image/jpg, image/jpeg, image/webp"
          hidden
          disabled={uploading}
          onChange={handleFileChange}
        />

        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
        >
          <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <UploadIcon />
          </div>
          <p className="mt-2.5 text-body-sm font-medium">
            <span className="text-primary">Cliquer pour ajouter</span> une photo
          </p>
          <p className="mt-1 text-body-xs">
            PNG, JPG ou WebP — compressée automatiquement
          </p>
        </label>
      </div>
    </ShowcaseSection>
  );
}
