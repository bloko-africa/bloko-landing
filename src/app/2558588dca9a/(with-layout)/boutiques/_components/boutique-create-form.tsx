"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { BoutiqueImageInput } from "@/components/Admin/boutique-image-input";
import { CommuneSelect } from "@/components/commune-select";
import { createBoutique } from "@/lib/actions/boutiques";
import { notifyPromise } from "@/lib/notify-promise";
import { slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

function generatePassword(): string {
  // Lisible pour être communiquée par téléphone (pas de caractères
  // ambigus 0/O, 1/l), assez forte pour passer les 8 caractères min.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function BoutiqueCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [handle, setHandle] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [password, setPassword] = useState(generatePassword);
  const [showPassword, setShowPassword] = useState(true);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const brandingId = useId();
  const [ville, setVille] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      const id = await notifyPromise(createBoutique(formData), {
        loading: "Création de la boutique...",
        success: "Boutique créée",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.push(`/2558588dca9a/boutiques/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ShowcaseSection title="Boutique" className="space-y-5.5 p-6.5!">
        <InputGroup
          label="Nom de la boutique"
          name="displayName"
          type="text"
          placeholder="Ex: Aisha Mode"
          required
          handleChange={(e) => {
            if (!handleTouched) setHandle(slugify(e.target.value));
          }}
        />
        <InputGroup
          label="Handle TikTok"
          name="handle"
          type="text"
          placeholder="Ex: aisha.boutique (sans @)"
          value={handle}
          required
          handleChange={(e) => {
            setHandleTouched(true);
            setHandle(e.target.value);
          }}
        />
        <p className="-mt-3 text-body-xs text-dark-5 dark:text-dark-6">
          Pré-rempli à partir du nom — modifiable si la vendeuse a déjà un
          handle TikTok précis.
        </p>

        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2">
          <InputGroup
            label="Pays"
            name="pays"
            type="text"
            placeholder="Ex: Bénin"
            defaultValue="Bénin"
            required
          />
          <CommuneSelect label="Ville" name="ville" value={ville} onChange={setVille} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Compte vendeuse" className="space-y-5.5 p-6.5!">
        <InputGroup
          label="Nom de la vendeuse"
          name="ownerName"
          type="text"
          placeholder="Ex: Aisha Traoré"
          required
        />
        <InputGroup
          label="Email"
          name="ownerEmail"
          type="email"
          placeholder="aisha@email.com"
          required
        />

        <div className="space-y-3">
          <label className="block text-body-sm font-medium text-dark dark:text-white">
            Mot de passe provisoire
          </label>
          <div className="flex items-center gap-2">
            <input
              name="ownerPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 font-mono outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setPassword(generatePassword())}
              className="shrink-0 rounded-lg border border-stroke px-3 py-2.5 text-body-xs font-medium text-dark hover:border-primary dark:border-dark-3 dark:text-white"
            >
              Régénérer
            </button>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="shrink-0 rounded-lg border border-stroke px-3 py-2.5 text-body-xs font-medium text-dark hover:border-primary dark:border-dark-3 dark:text-white"
            >
              {showPassword ? "Cacher" : "Voir"}
            </button>
          </div>
        </div>
        <p className="text-body-xs text-dark-5 dark:text-dark-6">
          Généré automatiquement — à communiquer directement à la vendeuse
          (pas d&apos;email automatique envoyé en v1).
        </p>
      </ShowcaseSection>

      <ShowcaseSection title="Reste de la fiche" className="space-y-3 p-6.5!">
        <button
          type="button"
          onClick={() => setBrandingOpen((v) => !v)}
          className="text-body-sm font-medium text-primary hover:underline"
        >
          {brandingOpen ? "− Masquer le branding" : "+ Ajouter un logo maintenant (optionnel)"}
        </button>
        {brandingOpen && (
          <div id={brandingId} className="grid grid-cols-1 gap-5.5 pt-4 sm:grid-cols-2">
            <BoutiqueImageInput name="logo" label="Logo" aspect="square" />
            <BoutiqueImageInput name="cover" label="Image de couverture" aspect="wide" />
          </div>
        )}
        <p className="text-body-xs text-dark-5 dark:text-dark-6">
          Logo, réseaux sociaux, garanties, mentions légales... tout ça se
          complète après coup depuis la fiche boutique — pas besoin de tout
          remplir pour créer le compte.
        </p>
      </ShowcaseSection>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
      >
        Créer la boutique
      </button>
    </form>
  );
}
