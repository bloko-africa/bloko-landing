import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { UTApi } from "uploadthing/server";

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

// UPLOADTHING_TOKEN lu automatiquement depuis l'environnement.
const utapi = new UTApi();

/**
 * Compresse (redimensionne + WebP) puis upload une image vers UploadThing.
 * `key` (renvoyé par UploadThing, pas un chemin de dossier — il n'y a pas de
 * hiérarchie de dossiers côté UploadThing) est nécessaire pour une éventuelle
 * suppression ultérieure via deleteProductImage.
 */
async function uploadImage(
  file: File,
  namePrefix: string,
  maxWidth: number = MAX_WIDTH,
): Promise<{ url: string; key: string }> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const compressed = await sharp(inputBuffer)
    .rotate() // corrige l'orientation EXIF avant tout resize
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const filename = `${namePrefix}-${randomUUID()}.webp`;
  const compressedFile = new File([compressed], filename, { type: "image/webp" });

  const { data, error } = await utapi.uploadFiles(compressedFile);

  if (error || !data) {
    throw new Error(`Échec upload image: ${error?.message ?? "réponse vide"}`);
  }

  return { url: data.url, key: data.key };
}

export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<{ url: string; key: string }> {
  return uploadImage(file, `product-${productId}`);
}

/** Logo/couverture de boutique — même compression, préfixe de nom dédié. */
export async function uploadBoutiqueImage(
  file: File,
  boutiqueId: string,
  kind: "logo" | "cover",
): Promise<{ url: string; key: string }> {
  return uploadImage(file, `boutique-${boutiqueId}-${kind}`);
}

/**
 * Preuve de livraison (photo du reçu/colis remis) — largeur plus modeste,
 * c'est un justificatif à consulter, pas une image marketing.
 */
export async function uploadLivraisonProof(
  file: File,
  orderId: string,
): Promise<{ url: string; key: string }> {
  return uploadImage(file, `livraison-${orderId}-proof`, 1200);
}

export async function deleteProductImage(key: string): Promise<void> {
  const { success } = await utapi.deleteFiles(key);
  if (!success) {
    throw new Error("Échec suppression image produit.");
  }
}
