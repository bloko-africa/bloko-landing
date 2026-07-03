"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import {
  deleteProductImage as removeStoredImage,
  uploadProductImage,
} from "@/lib/storage/upload-product-image";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Le prix doit être positif"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  collectionId: z.string().optional(),
  categoryId: z.string().optional(),
});

function parseForm(formData: FormData) {
  return productSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() || undefined,
    basePrice: formData.get("basePrice"),
    status: formData.get("status")?.toString() ?? "DRAFT",
    collectionId: formData.get("collectionId")?.toString() || undefined,
    categoryId: formData.get("categoryId")?.toString() || undefined,
  });
}

export async function createProduct(formData: FormData) {
  await requireRole(["editor", "admin"]);
  const data = parseForm(formData);

  const product = await db.product.create({
    data: {
      name: data.name,
      slug: `${slugify(data.name)}-${Date.now().toString(36)}`,
      description: data.description,
      basePrice: data.basePrice,
      status: data.status,
      collectionId: data.collectionId,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/shop/products");
  return product.id;
}

export async function updateProduct(formData: FormData) {
  await requireRole(["editor", "admin"]);
  const data = parseForm(formData);
  if (!data.id) throw new Error("id manquant");

  await db.product.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      status: data.status,
      collectionId: data.collectionId ?? null,
      categoryId: data.categoryId ?? null,
    },
  });

  revalidatePath("/shop/products");
  revalidatePath(`/shop/products/${data.id}`);
}

export async function deleteProduct(id: string) {
  await requireRole(["admin"]);

  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.delete({ where: { id } });

  await Promise.allSettled(
    images.map((image) => removeStoredImage(imagePathFromUrl(image.url))),
  );

  revalidatePath("/shop/products");
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
  await requireRole(["editor", "admin"]);
  const data = variantSchema.parse({
    productId: formData.get("productId"),
    sku: formData.get("sku"),
    size: formData.get("size")?.toString() || undefined,
    color: formData.get("color")?.toString() || undefined,
    colorHex: formData.get("colorHex")?.toString() || undefined,
    stock: formData.get("stock") || 0,
    priceOverride: formData.get("priceOverride") || undefined,
  });

  await db.productVariant.create({ data });
  revalidatePath(`/shop/products/${data.productId}`);
}

export async function updateVariantStock(variantId: string, stock: number) {
  await requireRole(["editor", "admin"]);
  if (stock < 0) throw new Error("Stock invalide");

  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });

  revalidatePath(`/shop/products/${variant.productId}`);
}

export async function deleteProductVariant(variantId: string) {
  await requireRole(["admin"]);
  const variant = await db.productVariant.delete({ where: { id: variantId } });
  revalidatePath(`/shop/products/${variant.productId}`);
}

function imagePathFromUrl(url: string): string {
  const marker = "/product-images/";
  const index = url.indexOf(marker);
  return index === -1 ? url : url.slice(index + marker.length);
}

export async function addProductImage(productId: string, file: File) {
  await requireRole(["editor", "admin"]);

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

  revalidatePath(`/shop/products/${productId}`);
}

export async function deleteProductImageAction(imageId: string) {
  await requireRole(["editor", "admin"]);

  const image = await db.productImage.delete({ where: { id: imageId } });
  await removeStoredImage(imagePathFromUrl(image.url));
  revalidatePath(`/shop/products/${image.productId}`);
}
