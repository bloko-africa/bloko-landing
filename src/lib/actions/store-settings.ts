"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^https?:\/\//.test(v), {
    message: "URL invalide (doit commencer par http(s)://)",
  });

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
  socialFacebook: optionalUrl,
  socialInstagram: optionalUrl,
  socialTiktok: optionalUrl,
  socialWhatsapp: optionalUrl,
  legalMentions: z.string().optional(),
  cgvContent: z.string().optional(),
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
    socialFacebook: formData.get("socialFacebook"),
    socialInstagram: formData.get("socialInstagram"),
    socialTiktok: formData.get("socialTiktok"),
    socialWhatsapp: formData.get("socialWhatsapp"),
    legalMentions: formData.get("legalMentions"),
    cgvContent: formData.get("cgvContent"),
  });

  const { featuredCollectionId, legalMentions, cgvContent, ...rest } = data;

  await db.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...rest,
      featuredCollectionId: featuredCollectionId ?? null,
      legalMentions: legalMentions ? sanitizeRichText(legalMentions) : null,
      cgvContent: cgvContent ? sanitizeRichText(cgvContent) : null,
    },
    update: {
      ...rest,
      featuredCollectionId: featuredCollectionId ?? null,
      legalMentions: legalMentions ? sanitizeRichText(legalMentions) : null,
      cgvContent: cgvContent ? sanitizeRichText(cgvContent) : null,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/mentions-legales");
  revalidatePath("/cgv");
}
