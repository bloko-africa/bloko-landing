"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Nom requis"),
  currency: z.enum(SUPPORTED_CURRENCIES),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format hex, ex: #a67c52)"),
  heroEyebrow: z.string().min(1, "Texte requis"),
  heroTitle: z.string().min(1, "Titre requis"),
  heroSubtitle: z.string().min(1, "Sous-titre requis"),
  heroCtaLabel: z.string().min(1, "Libellé du bouton requis"),
  featuredCollectionId: z.string().optional(),
});

export async function updateStoreSettings(formData: FormData) {
  await requireRole(["admin"]);

  const data = storeSettingsSchema.parse({
    storeName: formData.get("storeName"),
    currency: formData.get("currency"),
    accentColor: formData.get("accentColor"),
    heroEyebrow: formData.get("heroEyebrow"),
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    heroCtaLabel: formData.get("heroCtaLabel"),
    featuredCollectionId: formData.get("featuredCollectionId") || undefined,
  });

  const { featuredCollectionId, ...rest } = data;

  await db.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...rest, featuredCollectionId: featuredCollectionId ?? null },
    update: { ...rest, featuredCollectionId: featuredCollectionId ?? null },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
