"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const storeSettingsSchema = z.object({
  currency: z.enum(SUPPORTED_CURRENCIES),
  heroTitle: z.string().min(1, "Titre requis"),
  heroSubtitle: z.string().min(1, "Sous-titre requis"),
  heroCtaLabel: z.string().min(1, "Libellé du bouton requis"),
});

export async function updateStoreSettings(formData: FormData) {
  await requireRole(["admin"]);

  const data = storeSettingsSchema.parse({
    currency: formData.get("currency"),
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    heroCtaLabel: formData.get("heroCtaLabel"),
  });

  await db.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
