"use client";

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
  initial: {
    currency: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCtaLabel: string;
  };
};

export function StoreSettingsForm({ initial }: StoreSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const currencyId = useId();

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
