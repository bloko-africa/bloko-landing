"use server";

import { db } from "@/lib/db";
import { requireRole, requireBoutiqueAccess } from "@/lib/auth/session";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { slugify } from "@/lib/utils";
import {
  deleteProductImage as removeStoredImage,
  uploadProductImage,
} from "@/lib/storage/upload-product-image";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  id: z.string().optional(),
  boutiqueId: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Le prix doit être positif"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  collectionId: z.string().optional(),
  categoryId: z.string().optional(),
});

function parseForm(formData: FormData) {
  const data = productSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    boutiqueId: formData.get("boutiqueId")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() || undefined,
    basePrice: formData.get("basePrice"),
    status: formData.get("status")?.toString() ?? "DRAFT",
    collectionId: formData.get("collectionId")?.toString() || undefined,
    categoryId: formData.get("categoryId")?.toString() || undefined,
  });

  return {
    ...data,
    description: data.description ? sanitizeRichText(data.description) : undefined,
  };
}

async function getProductBoutiqueId(productId: string): Promise<string> {
  const product = await db.product.findUniqueOrThrow({
    where: { id: productId },
    select: { boutiqueId: true },
  });
  return product.boutiqueId;
}

export async function createProduct(formData: FormData) {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "editor",
    "admin",
    "vendeur",
  ]);
  const data = parseForm(formData);

  const boutiqueId = scopedBoutiqueId ?? data.boutiqueId;
  if (!boutiqueId) throw new Error("Boutique requise.");

  const product = await db.product.create({
    data: {
      boutiqueId,
      name: data.name,
      slug: `${slugify(data.name)}-${Date.now().toString(36)}`,
      description: data.description,
      basePrice: data.basePrice,
      status: data.status,
      collectionId: data.collectionId,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/2558588dca9a/products");
  return product.id;
}

export async function updateProduct(formData: FormData) {
  const data = parseForm(formData);
  if (!data.id) throw new Error("id manquant");

  const currentBoutiqueId = await getProductBoutiqueId(data.id);
  await requireBoutiqueAccess(["editor", "admin", "vendeur"], currentBoutiqueId);

  await db.product.update({
    where: { id: data.id },
    data: {
      // boutiqueId n'est pas modifiable ici — un produit ne change pas de
      // boutique en v1, ça évite de devoir migrer ses commandes/variantes.
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      status: data.status,
      collectionId: data.collectionId ?? null,
      categoryId: data.categoryId ?? null,
    },
  });

  revalidatePath("/2558588dca9a/products");
  revalidatePath(`/2558588dca9a/products/${data.id}`);
}

export async function deleteProduct(id: string) {
  await requireRole(["admin"]);

  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.delete({ where: { id } });

  await Promise.allSettled(
    images.map((image) => removeStoredImage(imageKeyFromUrl(image.url))),
  );

  revalidatePath("/2558588dca9a/products");
}

const variantSchema = z.object({
  productId: z.string(),
  sku: z.string().min(1, "Le SKU est requis"),
  size: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  priceOverride: z.coerce.number().positive().optional(),
});

export async function addProductVariant(formData: FormData) {
  const data = variantSchema.parse({
    productId: formData.get("productId"),
    sku: formData.get("sku"),
    size: formData.get("size")?.toString() || undefined,
    color: formData.get("color")?.toString() || undefined,
    colorHex: formData.get("colorHex")?.toString() || undefined,
    stock: formData.get("stock") || 0,
    priceOverride: formData.get("priceOverride") || undefined,
  });

  const boutiqueId = await getProductBoutiqueId(data.productId);
  await requireBoutiqueAccess(["editor", "admin", "vendeur"], boutiqueId);

  await db.productVariant.create({ data });
  revalidatePath(`/2558588dca9a/products/${data.productId}`);
}

export async function updateVariantStock(variantId: string, stock: number) {
  if (stock < 0) throw new Error("Stock invalide");

  const existing = await db.productVariant.findUniqueOrThrow({
    where: { id: variantId },
    select: { product: { select: { boutiqueId: true } } },
  });
  await requireBoutiqueAccess(
    ["editor", "admin", "vendeur"],
    existing.product.boutiqueId,
  );

  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });

  revalidatePath(`/2558588dca9a/products/${variant.productId}`);
}

export async function deleteProductVariant(variantId: string) {
  await requireRole(["admin"]);
  const variant = await db.productVariant.delete({ where: { id: variantId } });
  revalidatePath(`/2558588dca9a/products/${variant.productId}`);
}

// UploadThing sert chaque fichier sous .../f/<key> — le dernier segment de
// l'URL est directement la clé attendue par deleteProductImage.
function imageKeyFromUrl(url: string): string {
  return url.slice(url.lastIndexOf("/") + 1);
}

export async function addProductImage(productId: string, file: File) {
  const boutiqueId = await getProductBoutiqueId(productId);
  await requireBoutiqueAccess(["editor", "admin", "vendeur"], boutiqueId);

  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image.");
  }
  const MAX_SIZE = 8 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("Image trop lourde (max 8MB avant compression).");
  }

  const { url } = await uploadProductImage(file, productId);
  const lastImage = await db.productImage.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
  });

  await db.productImage.create({
    data: { productId, url, position: (lastImage?.position ?? -1) + 1 },
  });

  revalidatePath(`/2558588dca9a/products/${productId}`);
}

export async function deleteProductImageAction(imageId: string) {
  const existing = await db.productImage.findUniqueOrThrow({
    where: { id: imageId },
    select: { product: { select: { boutiqueId: true } } },
  });
  await requireBoutiqueAccess(
    ["editor", "admin", "vendeur"],
    existing.product.boutiqueId,
  );

  const image = await db.productImage.delete({ where: { id: imageId } });
  await removeStoredImage(imageKeyFromUrl(image.url));
  revalidatePath(`/2558588dca9a/products/${image.productId}`);
}
