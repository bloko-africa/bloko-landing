import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { PRODUCT_IMAGES_BUCKET, supabaseAdmin } from "./supabase-admin";

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

/**
 * Compresse (redimensionne + WebP) puis upload une image produit vers
 * Supabase Storage. N'agrandit jamais une image plus petite que MAX_WIDTH.
 */
export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<{ url: string; path: string }> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  const compressed = await sharp(inputBuffer)
    .rotate() // corrige l'orientation EXIF avant tout resize
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const path = `products/${productId}/${randomUUID()}.webp`;

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, compressed, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Échec upload image produit: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Échec suppression image produit: ${error.message}`);
  }
}
