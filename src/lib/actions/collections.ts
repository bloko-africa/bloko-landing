"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const collectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  season: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean(),
});

function parseForm(formData: FormData) {
  return collectionSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    season: formData.get("season")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    coverImage: formData.get("coverImage")?.toString() || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCollection(formData: FormData) {
  await requireRole(["editor", "admin"]);
  const data = parseForm(formData);

  await db.collection.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      season: data.season,
      description: data.description,
      coverImage: data.coverImage,
      isActive: data.isActive,
    },
  });

  revalidatePath("/shop/collections");
}

export async function updateCollection(formData: FormData) {
  await requireRole(["editor", "admin"]);
  const data = parseForm(formData);
  if (!data.id) throw new Error("id manquant");

  await db.collection.update({
    where: { id: data.id },
    data: {
      name: data.name,
      season: data.season,
      description: data.description,
      coverImage: data.coverImage,
      isActive: data.isActive,
    },
  });

  revalidatePath("/shop/collections");
}

export async function deleteCollection(id: string) {
  await requireRole(["admin"]);
  await db.collection.delete({ where: { id } });
  revalidatePath("/shop/collections");
}
