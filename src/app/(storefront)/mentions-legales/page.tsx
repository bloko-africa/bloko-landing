import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Mentions légales
      </h1>

      <div className="mt-8 space-y-8 text-body-sm text-dark-5 dark:text-dark-6">
        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            1. Édition du site
          </h2>
          <p>
            Le présent site est édité par : <strong>[Nom de l'entreprise]</strong>,
            [forme juridique — ex : Entreprise Individuelle / SARL / SUARL],
            immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM)
            sous le numéro <strong>[Numéro RCCM]</strong>, Identifiant Fiscal
            Unique (IFU) n° <strong>[Numéro IFU]</strong>, dont le siège social
            est situé au <strong>[Adresse complète, Ville, Bénin]</strong>.
          </p>
          <p className="mt-2">
            Numéro de téléphone : <strong>[Numéro de téléphone]</strong>
            <br />
            Adresse e-mail : <strong>[Adresse e-mail de contact]</strong>
          </p>
          <p className="mt-2">
            Directeur de la publication : <strong>[Nom et prénom(s)]</strong>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            2. Hébergement
          </h2>
          <p>
            Le site est hébergé par : <strong>[Nom de l'hébergeur]</strong>,
            dont le siège social est situé au{" "}
            <strong>[Adresse de l'hébergeur]</strong>.
          </p>
          <p className="mt-2">
            La base de données et les fichiers du site sont hébergés par
            Supabase Inc., et l'application est déployée via Vercel Inc.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            3. Propriété intellectuelle
          </h2>
          <p>
            L'ensemble des éléments présents sur ce site (textes, images,
            photographies, logos, mise en page, charte graphique) est protégé
            par le droit d'auteur et demeure la propriété exclusive de{" "}
            <strong>[Nom de l'entreprise]</strong>, sauf mention contraire.
            Toute reproduction, représentation ou exploitation, totale ou
            partielle, sans autorisation écrite préalable est interdite et
            constitue une contrefaçon.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            4. Données personnelles
          </h2>
          <p>
            Les informations collectées sur ce site (nom, téléphone, e-mail,
            adresse de livraison) sont utilisées exclusivement pour le
            traitement des commandes et la relation client. Conformément à la
            réglementation applicable en matière de protection des données
            personnelles, tu disposes d'un droit d'accès, de rectification et
            de suppression de tes données, exerçable en écrivant à{" "}
            <strong>[Adresse e-mail de contact]</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            5. Cookies
          </h2>
          <p>
            Le site utilise des cookies techniques strictement nécessaires à
            son fonctionnement (panier, session de connexion). Aucun cookie
            publicitaire ou de traçage tiers n'est déposé sans consentement
            préalable.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            6. Droit applicable
          </h2>
          <p>
            Les présentes mentions légales sont soumises au droit béninois et
            aux actes uniformes de l'Organisation pour l'Harmonisation en
            Afrique du Droit des Affaires (OHADA). En cas de litige, et à
            défaut de résolution amiable, les tribunaux compétents du Bénin
            seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
