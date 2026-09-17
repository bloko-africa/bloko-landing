"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { BoutiqueImageInput } from "@/components/Admin/boutique-image-input";
import { RichTextEditor } from "@/components/Admin/rich-text-editor";
import { CommuneSelect } from "@/components/commune-select";
import {
  TRUST_BADGE_ICON_KEYS,
  TRUST_BADGE_ICON_LABELS,
  type TrustBadge,
} from "@/lib/trust-badge-icons";
import { updateBoutique } from "@/lib/actions/boutiques";
import { notifyPromise } from "@/lib/notify-promise";
import { useState, type FormEvent } from "react";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspendue" },
];

// Formulaire long (7 sections) : une nav d'ancres sticky évite de scroller
// à l'aveugle pour retrouver une section précise.
const SECTIONS = [
  { id: "identite", label: "Identité" },
  { id: "localisation", label: "Localisation" },
  { id: "livraison", label: "Livraison" },
  { id: "branding", label: "Branding" },
  { id: "reseaux", label: "Réseaux" },
  { id: "garanties", label: "Garanties" },
  { id: "legal", label: "Légal" },
];

type BoutiqueEditFormProps = {
  initial: {
    id: string;
    displayName: string;
    status: string;
    pays: string;
    ville: string;
    quartier: string | null;
    adresse: string | null;
    accentColor: string;
    bio: string | null;
    heroEyebrow: string | null;
    heroTitle: string | null;
    heroSubtitle: string | null;
    heroCtaLabel: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTiktok: string | null;
    socialWhatsapp: string | null;
    logoUrl: string | null;
    coverImage: string | null;
    trustBadges: TrustBadge[];
    deliveryFee: number;
    deliveryFeeMode: string;
    legalMentions: string;
    cgvContent: string;
  };
};

export function BoutiqueEditForm({ initial }: BoutiqueEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [accentColor, setAccentColor] = useState(initial.accentColor);
  const [ville, setVille] = useState(initial.ville);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", initial.id);
    setLoading(true);

    try {
      await notifyPromise(updateBoutique(formData), {
        loading: "Enregistrement...",
        success: "Boutique mise à jour",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <nav className="sticky top-18 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-lg bg-gray-1 p-1.5 dark:bg-dark-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 rounded-md px-3 py-1.5 text-body-xs font-medium text-dark-5 hover:bg-white hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <ShowcaseSection id="identite" title="Identité" className="space-y-5.5 p-6.5!">
        <InputGroup
          label="Nom de la boutique"
          name="displayName"
          type="text"
          placeholder="Ex: Aisha Mode"
          defaultValue={initial.displayName}
          required
        />

        <div className="space-y-3">
          <label className="block text-body-sm font-medium text-dark dark:text-white">
            Statut
          </label>
          <select
            name="status"
            defaultValue={initial.status}
            className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-body-xs text-dark-5 dark:text-dark-6">
            Une boutique suspendue disparaît du site public mais garde ses
            données.
          </p>
        </div>

        <TextAreaGroup
          label="Bio"
          name="bio"
          placeholder="Courte présentation de la boutique"
          defaultValue={initial.bio ?? undefined}
        />
      </ShowcaseSection>

      <ShowcaseSection id="localisation" title="Localisation" className="space-y-5.5 p-6.5!">
        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2">
          <InputGroup
            label="Pays"
            name="pays"
            type="text"
            placeholder="Ex: Bénin"
            defaultValue={initial.pays}
            required
          />
          <CommuneSelect label="Ville" name="ville" value={ville} onChange={setVille} />
          <InputGroup
            label="Quartier (optionnel)"
            name="quartier"
            type="text"
            placeholder="Ex: Fidjrossè"
            defaultValue={initial.quartier ?? undefined}
          />
          <InputGroup
            label="Adresse (optionnel)"
            name="adresse"
            type="text"
            placeholder="Repère, rue..."
            defaultValue={initial.adresse ?? undefined}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="livraison" title="Livraison" className="space-y-5.5 p-6.5!">
        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2">
          <InputGroup
            label="Frais de livraison"
            name="deliveryFee"
            type="number"
            placeholder="0"
            defaultValue={String(initial.deliveryFee)}
          />
          <div className="space-y-3">
            <label className="block text-body-sm font-medium text-dark dark:text-white">
              Qui paie la livraison ?
            </label>
            <select
              name="deliveryFeeMode"
              defaultValue={initial.deliveryFeeMode}
              className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              <option value="A_LA_CHARGE_DU_CLIENT">
                À la charge du client (payé en espèces à la réception)
              </option>
              <option value="INCLUS">Inclus dans le paiement en ligne</option>
            </select>
          </div>
        </div>
        <p className="text-body-xs text-dark-5 dark:text-dark-6">
          Si tu as ton propre service de livraison (ou un tarif fixe avec ton
          agence), indique-le ici — sinon laisse à 0 et « à la charge du
          client », l&apos;acheteur négocie directement le tarif avec le
          livreur.
        </p>
      </ShowcaseSection>

      <ShowcaseSection id="branding" title="Branding public" className="space-y-5.5 p-6.5!">
        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2">
          <BoutiqueImageInput name="logo" label="Logo" currentUrl={initial.logoUrl} aspect="square" />
          <BoutiqueImageInput
            name="cover"
            label="Image de couverture"
            currentUrl={initial.coverImage}
            aspect="wide"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="accentColor"
            className="block text-body-sm font-medium text-dark dark:text-white"
          >
            Couleur d&apos;accent
          </label>
          <div className="flex items-center gap-3">
            <input
              id="accentColor"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="size-12 shrink-0 cursor-pointer rounded-lg border border-stroke bg-transparent p-1 dark:border-dark-3"
            />
            <input
              type="text"
              name="accentColor"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              pattern="^#[0-9a-fA-F]{6}$"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
        </div>

        <InputGroup
          label="Texte au-dessus du titre (optionnel)"
          name="heroEyebrow"
          type="text"
          placeholder="Ex: Nouvelle collection"
          defaultValue={initial.heroEyebrow ?? undefined}
        />
        <InputGroup
          label="Titre d'accueil (optionnel)"
          name="heroTitle"
          type="text"
          placeholder="Ex: Ce que tu vends, pensé pour tes clientes"
          defaultValue={initial.heroTitle ?? undefined}
        />
        <InputGroup
          label="Sous-titre (optionnel)"
          name="heroSubtitle"
          type="text"
          placeholder="Ex: Livraison à Cotonou sous 48h"
          defaultValue={initial.heroSubtitle ?? undefined}
        />
        <InputGroup
          label="Texte du bouton (optionnel)"
          name="heroCtaLabel"
          type="text"
          placeholder="Ex: Découvrir la boutique"
          defaultValue={initial.heroCtaLabel ?? undefined}
        />
      </ShowcaseSection>

      <ShowcaseSection id="reseaux" title="Réseaux sociaux" className="space-y-5.5 p-6.5!">
        <InputGroup
          label="Facebook"
          name="socialFacebook"
          type="url"
          placeholder="https://facebook.com/..."
          defaultValue={initial.socialFacebook ?? undefined}
        />
        <InputGroup
          label="Instagram"
          name="socialInstagram"
          type="url"
          placeholder="https://instagram.com/..."
          defaultValue={initial.socialInstagram ?? undefined}
        />
        <InputGroup
          label="TikTok"
          name="socialTiktok"
          type="url"
          placeholder="https://tiktok.com/@..."
          defaultValue={initial.socialTiktok ?? undefined}
        />
        <InputGroup
          label="WhatsApp"
          name="socialWhatsapp"
          type="url"
          placeholder="https://wa.me/229..."
          defaultValue={initial.socialWhatsapp ?? undefined}
        />
      </ShowcaseSection>

      <ShowcaseSection id="garanties" title="Garanties (page boutique)" className="space-y-6 p-6.5!">
        <p className="text-body-xs text-dark-5 dark:text-dark-6">
          Les 4 encarts affichés sous les collections sur la page d&apos;accueil
          de la boutique (icône, titre, sous-titre).
        </p>
        {initial.trustBadges.map((badge, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-3 rounded-lg border border-stroke p-4 sm:grid-cols-[10rem_1fr_1fr] dark:border-dark-3"
          >
            <select
              name={`trustBadgeIcon${i}`}
              defaultValue={badge.icon}
              className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-3 py-2.5 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              {TRUST_BADGE_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {TRUST_BADGE_ICON_LABELS[key]}
                </option>
              ))}
            </select>
            <input
              type="text"
              name={`trustBadgeTitle${i}`}
              defaultValue={badge.title}
              placeholder="Titre"
              required
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
            <input
              type="text"
              name={`trustBadgeSubtitle${i}`}
              defaultValue={badge.subtitle}
              placeholder="Sous-titre"
              required
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
        ))}
      </ShowcaseSection>

      <ShowcaseSection id="legal" title="Contenu légal" className="space-y-5.5 p-6.5!">
        <RichTextEditor
          label="Mentions légales"
          name="legalMentions"
          defaultValue={initial.legalMentions}
        />
        <RichTextEditor
          label="Conditions générales de vente"
          name="cgvContent"
          defaultValue={initial.cgvContent}
        />
        <p className="text-body-xs text-dark-5 dark:text-dark-6">
          Remplace les [crochets] par les vraies informations de la vendeuse
          (RCCM/IFU si applicable, adresse, délais...).
        </p>
      </ShowcaseSection>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
      >
        Enregistrer
      </button>
    </form>
  );
}
