"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole, requireBoutiqueAccess } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { uploadBoutiqueImage } from "@/lib/storage/upload-product-image";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { TRUST_BADGE_ICON_KEYS, DEFAULT_TRUST_BADGES } from "@/lib/trust-badge-icons";
import {
  DEFAULT_BOUTIQUE_MENTIONS_LEGALES,
  DEFAULT_BOUTIQUE_CGV,
} from "@/lib/legal-content";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function readImageFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

const TRUST_BADGE_COUNT = 4;

const trustBadgesSchema = z
  .array(
    z.object({
      icon: z.enum(TRUST_BADGE_ICON_KEYS),
      title: z.string().min(1, "Titre requis"),
      subtitle: z.string().min(1, "Sous-titre requis"),
    }),
  )
  .length(TRUST_BADGE_COUNT);

function parseTrustBadgesFromForm(formData: FormData) {
  return trustBadgesSchema.parse(
    Array.from({ length: TRUST_BADGE_COUNT }, (_, i) => ({
      icon: formData.get(`trustBadgeIcon${i}`),
      title: formData.get(`trustBadgeTitle${i}`),
      subtitle: formData.get(`trustBadgeSubtitle${i}`),
    })),
  );
}

// Onboarding vendeuse admin-only en v1 (pas de self-service) : on crée le
// compte vendeur et la boutique dans le même geste, l'admin renseigne un
// mot de passe provisoire à communiquer à la vendeuse.
const createBoutiqueSchema = z.object({
  handle: z.string().min(2, "Handle requis (2 caractères min)"),
  displayName: z.string().min(1, "Le nom est requis"),
  pays: z.string().min(1, "Pays requis"),
  ville: z.string().min(1, "Ville requise"),
  quartier: z.string().optional(),
  adresse: z.string().optional(),
  ownerName: z.string().min(1, "Nom de la vendeuse requis"),
  ownerEmail: z.string().email("Email invalide"),
  ownerPassword: z.string().min(8, "8 caractères minimum"),
});

function normalizeHandle(value: string): string {
  // Un handle TikTok utilisé dans une URL (/b/[handle]) : on retire un
  // éventuel "@" et on passe au même slug que les autres identifiants du
  // site plutôt que d'inventer une règle à part.
  return slugify(value.replace(/^@/, ""));
}

export async function createBoutique(formData: FormData) {
  await requireRole(["admin"]);

  const data = createBoutiqueSchema.parse({
    handle: formData.get("handle")?.toString() ?? "",
    displayName: formData.get("displayName")?.toString() ?? "",
    pays: formData.get("pays")?.toString() || "Bénin",
    ville: formData.get("ville")?.toString() ?? "",
    quartier: formData.get("quartier")?.toString() || undefined,
    adresse: formData.get("adresse")?.toString() || undefined,
    ownerName: formData.get("ownerName")?.toString() ?? "",
    ownerEmail: formData.get("ownerEmail")?.toString() ?? "",
    ownerPassword: formData.get("ownerPassword")?.toString() ?? "",
  });

  const handle = normalizeHandle(data.handle);
  if (!handle) throw new Error("Handle invalide.");

  const existing = await db.boutique.findUnique({ where: { handle } });
  if (existing) throw new Error(`Le handle "${handle}" est déjà utilisé.`);

  // Créé côté serveur, sans session (même mécanisme que checkout() pour un
  // compte client créé à la volée) : auth.api.createUser applique déjà le
  // hachage du mot de passe et le rôle demandé.
  const { user } = await auth.api.createUser({
    body: {
      email: data.ownerEmail,
      password: data.ownerPassword,
      name: data.ownerName,
      role: "vendeur",
    },
  });

  const boutique = await db.boutique.create({
    data: {
      handle,
      displayName: data.displayName,
      status: "ACTIVE",
      ownerId: user.id,
      pays: data.pays,
      ville: data.ville,
      quartier: data.quartier,
      adresse: data.adresse,
      // Sans customisation, le branding par défaut de la plateforme est
      // noir/blanc — la vendeuse choisit ensuite sa propre couleur d'accent
      // depuis /2558588dca9a/boutiques/[id].
      accentColor: "#141414",
      trustBadges: DEFAULT_TRUST_BADGES,
      legalMentions: DEFAULT_BOUTIQUE_MENTIONS_LEGALES,
      cgvContent: DEFAULT_BOUTIQUE_CGV,
    },
  });

  const logoFile = readImageFile(formData, "logo");
  const coverFile = readImageFile(formData, "cover");
  if (logoFile || coverFile) {
    const [logo, cover] = await Promise.all([
      logoFile ? uploadBoutiqueImage(logoFile, boutique.id, "logo") : null,
      coverFile ? uploadBoutiqueImage(coverFile, boutique.id, "cover") : null,
    ]);
    await db.boutique.update({
      where: { id: boutique.id },
      data: {
        logoUrl: logo?.url,
        coverImage: cover?.url,
      },
    });
  }

  await db.user.update({
    where: { id: user.id },
    data: { boutiqueId: boutique.id },
  });

  revalidatePath("/2558588dca9a/boutiques");
  return boutique.id;
}

const updateBoutiqueSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1, "Le nom est requis"),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
  pays: z.string().min(1, "Pays requis"),
  ville: z.string().min(1, "Ville requise"),
  quartier: z.string().optional(),
  adresse: z.string().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format hex, ex: #a67c52)"),
  bio: z.string().optional(),
  heroEyebrow: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCtaLabel: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialTiktok: z.string().optional(),
  socialWhatsapp: z.string().optional(),
  legalMentions: z.string().optional(),
  cgvContent: z.string().optional(),
  deliveryFee: z.coerce.number().min(0),
  deliveryFeeMode: z.enum(["INCLUS", "A_LA_CHARGE_DU_CLIENT"]),
});

export async function updateBoutique(formData: FormData) {
  // Branding/édition admin-only en v1 (pas encore de self-service vendeuse),
  // cohérent avec createBoutique ci-dessus.
  await requireRole(["admin"]);

  const data = updateBoutiqueSchema.parse({
    id: formData.get("id")?.toString() ?? "",
    displayName: formData.get("displayName")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "PENDING",
    pays: formData.get("pays")?.toString() || "Bénin",
    ville: formData.get("ville")?.toString() ?? "",
    quartier: formData.get("quartier")?.toString() || undefined,
    adresse: formData.get("adresse")?.toString() || undefined,
    accentColor: formData.get("accentColor")?.toString() ?? "#a67c52",
    bio: formData.get("bio")?.toString() || undefined,
    heroEyebrow: formData.get("heroEyebrow")?.toString() || undefined,
    heroTitle: formData.get("heroTitle")?.toString() || undefined,
    heroSubtitle: formData.get("heroSubtitle")?.toString() || undefined,
    heroCtaLabel: formData.get("heroCtaLabel")?.toString() || undefined,
    socialFacebook: formData.get("socialFacebook")?.toString() || undefined,
    socialInstagram: formData.get("socialInstagram")?.toString() || undefined,
    socialTiktok: formData.get("socialTiktok")?.toString() || undefined,
    socialWhatsapp: formData.get("socialWhatsapp")?.toString() || undefined,
    legalMentions: formData.get("legalMentions")?.toString() || undefined,
    cgvContent: formData.get("cgvContent")?.toString() || undefined,
    deliveryFee: formData.get("deliveryFee")?.toString() || 0,
    deliveryFeeMode: formData.get("deliveryFeeMode")?.toString() ?? "A_LA_CHARGE_DU_CLIENT",
  });
  const trustBadges = parseTrustBadgesFromForm(formData);

  const { id, ...rest } = data;

  const logoFile = readImageFile(formData, "logo");
  const coverFile = readImageFile(formData, "cover");
  const [logo, cover] = await Promise.all([
    logoFile ? uploadBoutiqueImage(logoFile, id, "logo") : null,
    coverFile ? uploadBoutiqueImage(coverFile, id, "cover") : null,
  ]);

  await db.boutique.update({
    where: { id },
    data: {
      ...rest,
      legalMentions: rest.legalMentions ? sanitizeRichText(rest.legalMentions) : rest.legalMentions,
      cgvContent: rest.cgvContent ? sanitizeRichText(rest.cgvContent) : rest.cgvContent,
      trustBadges,
      ...(logo ? { logoUrl: logo.url } : {}),
      ...(cover ? { coverImage: cover.url } : {}),
    },
  });

  revalidatePath("/2558588dca9a/boutiques");
  revalidatePath(`/2558588dca9a/boutiques/${id}`);
}

const updateBoutiqueContactSchema = z.object({
  id: z.string().min(1),
  savPhone: z.string().optional(),
  socialWhatsapp: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialTiktok: z.string().optional(),
  deliveryDetails: z.string().max(1000).optional(),
  passCommissionToClient: z.boolean(),
});

// Contrairement à updateBoutique (admin-only), ouvert à la vendeuse pour sa
// propre boutique — seuls les champs de contact/SAV/livraison/facturation,
// pas le reste de la fiche (statut, tarif de livraison, CGV, branding) qui
// reste admin-only. deliveryDetails est un texte libre : pas de système de
// zones structuré, la vendeuse décrit sa livraison à sa façon.
// passCommissionToClient : voir src/lib/pricing.ts::getBuyerPrice — bascule
// qui prix le client paie (marge de la vendeuse préservée dans les 2 cas).
export async function updateBoutiqueContact(formData: FormData) {
  const id = formData.get("id")?.toString() ?? "";
  await requireBoutiqueAccess(["admin", "vendeur"], id);

  const data = updateBoutiqueContactSchema.parse({
    id,
    savPhone: formData.get("savPhone")?.toString() || undefined,
    socialWhatsapp: formData.get("socialWhatsapp")?.toString() || undefined,
    socialFacebook: formData.get("socialFacebook")?.toString() || undefined,
    socialInstagram: formData.get("socialInstagram")?.toString() || undefined,
    socialTiktok: formData.get("socialTiktok")?.toString() || undefined,
    deliveryDetails: formData.get("deliveryDetails")?.toString() || undefined,
    passCommissionToClient: formData.get("passCommissionToClient") === "on",
  });

  await db.boutique.update({
    where: { id },
    data: {
      savPhone: data.savPhone ?? null,
      socialWhatsapp: data.socialWhatsapp ?? null,
      socialFacebook: data.socialFacebook ?? null,
      socialInstagram: data.socialInstagram ?? null,
      socialTiktok: data.socialTiktok ?? null,
      deliveryDetails: data.deliveryDetails ?? null,
      passCommissionToClient: data.passCommissionToClient,
    },
  });

  revalidatePath("/2558588dca9a/contact-sav");
  const boutique = await db.boutique.findUnique({ where: { id }, select: { handle: true } });
  if (boutique) {
    revalidatePath(`/b/${boutique.handle}`);
    revalidatePath(`/b/${boutique.handle}/commande`);
  }
}
