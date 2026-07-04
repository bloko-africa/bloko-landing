"use client";

import { RichTextEditor } from "@/components/Admin/rich-text-editor";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { notifyPromise } from "@/lib/notify-promise";
import { updateStoreSettings } from "@/lib/actions/store-settings";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { useId, useState, type FormEvent } from "react";

const CURRENCY_LABELS: Record<string, string> = {
  XOF: "XOF — Franc CFA (UEMOA : Bénin, Côte d'Ivoire...)",
  XAF: "XAF — Franc CFA (CEMAC)",
  CDF: "CDF — Franc congolais",
  USD: "USD — Dollar américain",
  KES: "KES — Shilling kényan",
  RWF: "RWF — Franc rwandais",
  SLE: "SLE — Leone sierra-léonais",
  UGX: "UGX — Shilling ougandais",
  ZMW: "ZMW — Kwacha zambien",
};

type StoreSettingsFormProps = {
  collections: { id: string; name: string }[];
  initial: {
    storeName: string;
    currency: string;
    accentColor: string;
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCtaLabel: string;
    featuredCollectionId: string | null;
    socialFacebook: string;
    socialInstagram: string;
    socialTiktok: string;
    socialWhatsapp: string;
    legalMentions: string;
    cgvContent: string;
  };
};

export function StoreSettingsForm({ collections, initial }: StoreSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [accentColor, setAccentColor] = useState(initial.accentColor);
  const currencyId = useId();
  const collectionId = useId();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      await notifyPromise(updateStoreSettings(formData), {
        loading: "Enregistrement...",
        success: "Paramètres enregistrés",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ShowcaseSection title="Identité de la boutique" className="space-y-5.5 p-6.5!">
        <InputGroup
          label="Nom de la boutique"
          name="storeName"
          type="text"
          placeholder="Ex: Mode Shop"
          defaultValue={initial.storeName}
          required
        />

        <div className="space-y-3">
          <label
            htmlFor="accentColor"
            className="block text-body-sm font-medium text-dark dark:text-white"
          >
            Couleur d'accent
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
              placeholder="#a67c52"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
          <p className="text-body-xs text-dark-5 dark:text-dark-6">
            Utilisée pour les boutons et liens du site public (pas le tableau
            de bord admin).
          </p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Devise" className="space-y-5.5 p-6.5!">
        <div className="space-y-3">
          <label
            htmlFor={currencyId}
            className="block text-body-sm font-medium text-dark dark:text-white"
          >
            Devise de la boutique
          </label>
          <select
            id={currencyId}
            name="currency"
            defaultValue={initial.currency}
            className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            {SUPPORTED_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {CURRENCY_LABELS[code]}
              </option>
            ))}
          </select>
          <p className="text-body-xs text-dark-5 dark:text-dark-6">
            Utilisée pour les nouvelles commandes et les paiements GeniusPay.
            Ne convertit pas les prix déjà saisis.
          </p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Contenu de la page d'accueil"
        className="space-y-5.5 p-6.5!"
      >
        <InputGroup
          label="Texte au-dessus du titre (eyebrow)"
          name="heroEyebrow"
          type="text"
          placeholder="Ex: Nouvelle collection"
          defaultValue={initial.heroEyebrow}
          required
        />
        <InputGroup
          label="Titre principal (hero)"
          name="heroTitle"
          type="text"
          placeholder="Ex: Le prêt-à-porter, pensé pour vous"
          defaultValue={initial.heroTitle}
          required
        />
        <TextAreaGroup
          label="Sous-titre"
          name="heroSubtitle"
          placeholder="Ex: Des pièces sélectionnées, livrées depuis Cotonou et Abidjan."
          defaultValue={initial.heroSubtitle}
        />
        <InputGroup
          label="Texte du bouton"
          name="heroCtaLabel"
          type="text"
          placeholder="Ex: Découvrir la boutique"
          defaultValue={initial.heroCtaLabel}
          required
        />

        <div className="space-y-3">
          <label
            htmlFor={collectionId}
            className="block text-body-sm font-medium text-dark dark:text-white"
          >
            Collection mise en avant (image de la page d'accueil)
          </label>
          <select
            id={collectionId}
            name="featuredCollectionId"
            defaultValue={initial.featuredCollectionId ?? ""}
            className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">Aucune (pas d'image, texte seul)</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-body-xs text-dark-5 dark:text-dark-6">
            L'image de couverture de cette collection sera affichée à côté du
            titre principal.
          </p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Réseaux sociaux" className="space-y-5.5 p-6.5!">
        <InputGroup
          label="Facebook"
          name="socialFacebook"
          type="url"
          placeholder="https://facebook.com/..."
          defaultValue={initial.socialFacebook}
        />
        <InputGroup
          label="Instagram"
          name="socialInstagram"
          type="url"
          placeholder="https://instagram.com/..."
          defaultValue={initial.socialInstagram}
        />
        <InputGroup
          label="TikTok"
          name="socialTiktok"
          type="url"
          placeholder="https://tiktok.com/@..."
          defaultValue={initial.socialTiktok}
        />
        <InputGroup
          label="WhatsApp"
          name="socialWhatsapp"
          type="url"
          placeholder="https://wa.me/229..."
          defaultValue={initial.socialWhatsapp}
        />
        <p className="text-body-xs text-dark-5 dark:text-dark-6">
          Laisse un champ vide pour masquer l&apos;icône correspondante dans le
          pied de page.
        </p>
      </ShowcaseSection>

      <ShowcaseSection title="Contenu légal" className="space-y-5.5 p-6.5!">
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
          Remplace les [crochets] par les vraies informations de
          l&apos;entreprise (RCCM, IFU, adresse...).
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
