"use server";

import { db } from "@/lib/db";
import { requireRole, requireBoutiqueAccess } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { revalidateDashboardPath } from "@/lib/dashboard-space-server";
import { z } from "zod";

const collectionSchema = z.object({
  id: z.string().optional(),
  boutiqueId: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  season: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean(),
});

function parseForm(formData: FormData) {
  return collectionSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    boutiqueId: formData.get("boutiqueId")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    season: formData.get("season")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    coverImage: formData.get("coverImage")?.toString() || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCollection(formData: FormData) {
  const { scopedBoutiqueId } = await requireBoutiqueAccess([
    "editor",
    "admin",
    "vendeur",
  ]);
  const data = parseForm(formData);

  const boutiqueId = scopedBoutiqueId ?? data.boutiqueId;
  if (!boutiqueId) throw new Error("Boutique requise.");

  await db.collection.create({
    data: {
      boutiqueId,
      name: data.name,
      slug: slugify(data.name),
      season: data.season,
      description: data.description,
      coverImage: data.coverImage,
      isActive: data.isActive,
    },
  });

  revalidateDashboardPath("/collections");
}

export async function updateCollection(formData: FormData) {
  const data = parseForm(formData);
  if (!data.id) throw new Error("id manquant");

  const current = await db.collection.findUniqueOrThrow({
    where: { id: data.id },
    select: { boutiqueId: true },
  });
  await requireBoutiqueAccess(["editor", "admin", "vendeur"], current.boutiqueId);

  await db.collection.update({
    where: { id: data.id },
    data: {
      // boutiqueId immuable, comme pour Product.
      name: data.name,
      season: data.season,
      description: data.description,
      coverImage: data.coverImage,
      isActive: data.isActive,
    },
  });

  revalidateDashboardPath("/collections");
}

export async function deleteCollection(id: string) {
  await requireRole(["admin"]);
  await db.collection.delete({ where: { id } });
  revalidateDashboardPath("/collections");
}
