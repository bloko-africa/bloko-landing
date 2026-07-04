import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CgvPage() {
  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Conditions générales de vente
      </h1>
      <p className="mt-2 text-body-sm text-dark-5 dark:text-dark-6">
        Dernière mise à jour : [Date]
      </p>

      <div className="mt-8 space-y-8 text-body-sm text-dark-5 dark:text-dark-6">
        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            1. Objet
          </h2>
          <p>
            Les présentes conditions générales de vente (CGV) régissent les
            relations contractuelles entre <strong>[Nom de l'entreprise]</strong>
            , [forme juridique], immatriculée au RCCM sous le n°{" "}
            <strong>[Numéro RCCM]</strong>, IFU n° <strong>[Numéro IFU]</strong>,
            dont le siège social est situé au{" "}
            <strong>[Adresse complète]</strong> (ci-après « la Boutique »), et
            toute personne physique ou morale souhaitant procéder à un achat
            via le présent site (ci-après « le Client »).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            2. Produits et prix
          </h2>
          <p>
            Les produits proposés à la vente sont ceux figurant sur le site au
            jour de la consultation, dans la limite des stocks disponibles.
            Les prix sont indiqués en [devise, ex : Franc CFA (XOF)], toutes
            taxes comprises, hors frais de livraison qui sont précisés avant
            la validation de la commande. La Boutique se réserve le droit de
            modifier ses prix à tout moment, les produits étant facturés sur
            la base du tarif en vigueur au moment de la validation de la
            commande.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            3. Commande
          </h2>
          <p>
            La commande est passée directement sur le site après création
            d'un compte client. Le Client sélectionne les articles souhaités
            (taille, couleur), les ajoute au panier puis valide sa commande en
            renseignant ses coordonnées. La confirmation de commande vaut
            acceptation des présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            4. Paiement
          </h2>
          <p>
            Le paiement s'effectue en ligne, au moment de la commande, via les
            moyens de paiement proposés sur le site (Mobile Money, carte
            bancaire), traités par un prestataire de paiement tiers sécurisé.
            La Boutique ne collecte ni ne conserve aucune donnée de paiement.
            La commande n'est considérée comme définitive qu'après
            confirmation du paiement par le prestataire.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            5. Livraison
          </h2>
          <p>
            Les commandes sont livrées à l'adresse indiquée par le Client lors
            de la commande, dans un délai indicatif de{" "}
            <strong>[Délai de livraison, ex : 2 à 5 jours ouvrés]</strong>{" "}
            selon la zone de livraison. Les frais de livraison sont précisés
            avant validation de la commande. La Boutique livre actuellement :{" "}
            <strong>[zones de livraison, ex : Cotonou et environs, Côte d'Ivoire]</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            6. Droit de rétractation et retours
          </h2>
          <p>
            Le Client dispose d'un délai de{" "}
            <strong>[Délai, ex : 7 jours]</strong> à compter de la réception
            du produit pour demander un échange ou un retour, à condition que
            l'article soit retourné dans son état d'origine, non porté et
            avec ses étiquettes. Les frais de retour sont à la charge du{" "}
            <strong>[Client / de la Boutique — à préciser]</strong>. Pour
            initier un retour, le Client contacte{" "}
            <strong>[Adresse e-mail ou numéro de contact]</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            7. Garanties
          </h2>
          <p>
            La Boutique garantit la conformité des produits vendus. Tout
            article défectueux ou non conforme à la commande peut faire
            l'objet d'un échange ou d'un remboursement, sur présentation d'une
            preuve d'achat, dans un délai de{" "}
            <strong>[Délai, ex : 14 jours]</strong> après réception.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            8. Responsabilité
          </h2>
          <p>
            La Boutique ne saurait être tenue responsable des dommages
            résultant d'une mauvaise utilisation des produits, d'un cas de
            force majeure, ou de retards de livraison imputables au
            transporteur.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            9. Données personnelles
          </h2>
          <p>
            Les données collectées lors de la commande sont nécessaires à son
            traitement et ne sont transmises qu'aux prestataires impliqués
            dans son exécution (paiement, livraison). Voir les{" "}
            <a href="/mentions-legales" className="text-primary hover:underline">
              mentions légales
            </a>{" "}
            pour plus de détails.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            10. Litiges et droit applicable
          </h2>
          <p>
            Les présentes CGV sont soumises au droit béninois et aux actes
            uniformes OHADA. En cas de litige, le Client est invité à
            contacter la Boutique en priorité pour une résolution amiable, à{" "}
            <strong>[Adresse e-mail de contact]</strong>. À défaut d'accord
            amiable, les tribunaux compétents du Bénin seront seuls
            compétents.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-body-lg font-medium text-dark dark:text-white">
            11. Contact
          </h2>
          <p>
            Pour toute question relative à une commande ou aux présentes CGV :{" "}
            <strong>[Adresse e-mail]</strong> — <strong>[Numéro de téléphone / WhatsApp]</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
