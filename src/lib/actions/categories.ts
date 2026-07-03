"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  parentId: z.string().optional(),
});

function parseForm(formData: FormData) {
  return categorySchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    parentId: formData.get("parentId")?.toString() || undefined,
  });
}

export async function createCategory(formData: FormData) {
  await requireRole(["editor", "admin"]);
  const data = parseForm(formData);

  await db.category.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      parentId: data.parentId,
    },
  });

  revalidatePath("/shop/categories");
}

export async function updateCategory(formData: FormData) {
  await requireRole(["editor", "admin"]);
  const data = parseForm(formData);
  if (!data.id) throw new Error("id manquant");

  if (data.parentId === data.id) {
    throw new Error("Une catégorie ne peut pas être son propre parent.");
  }

  await db.category.update({
    where: { id: data.id },
    data: {
      name: data.name,
      parentId: data.parentId ?? null,
    },
  });

  revalidatePath("/shop/categories");
}

export async function deleteCategory(id: string) {
  await requireRole(["admin"]);
  await db.category.delete({ where: { id } });
  revalidatePath("/shop/categories");
}
