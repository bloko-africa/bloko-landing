import "server-only";
import { db } from "@/lib/db";
import { type SupportedCurrency } from "@/lib/currencies";

const DEFAULT_MENTIONS_LEGALES = `
<h2>1. Édition du site</h2>
<p>Le présent site est édité par : <strong>[Nom de l'entreprise]</strong>, [forme juridique — ex : Entreprise Individuelle / SARL / SUARL], immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>[Numéro RCCM]</strong>, Identifiant Fiscal Unique (IFU) n° <strong>[Numéro IFU]</strong>, dont le siège social est situé au <strong>[Adresse complète, Ville, Bénin]</strong>.</p>
<p>Numéro de téléphone : <strong>[Numéro de téléphone]</strong><br>Adresse e-mail : <strong>[Adresse e-mail de contact]</strong></p>
<p>Directeur de la publication : <strong>[Nom et prénom(s)]</strong></p>
<h2>2. Hébergement</h2>
<p>Le site est hébergé par : <strong>[Nom de l'hébergeur]</strong>, dont le siège social est situé au <strong>[Adresse de l'hébergeur]</strong>.</p>
<p>La base de données et les fichiers du site sont hébergés par Supabase Inc., et l'application est déployée via Vercel Inc.</p>
<h2>3. Propriété intellectuelle</h2>
<p>L'ensemble des éléments présents sur ce site (textes, images, photographies, logos, mise en page, charte graphique) est protégé par le droit d'auteur et demeure la propriété exclusive de <strong>[Nom de l'entreprise]</strong>, sauf mention contraire. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon.</p>
<h2>4. Données personnelles</h2>
<p>Les informations collectées sur ce site (nom, téléphone, e-mail, adresse de livraison) sont utilisées exclusivement pour le traitement des commandes et la relation client. Conformément à la réglementation applicable en matière de protection des données personnelles, tu disposes d'un droit d'accès, de rectification et de suppression de tes données, exerçable en écrivant à <strong>[Adresse e-mail de contact]</strong>.</p>
<h2>5. Cookies</h2>
<p>Le site utilise des cookies techniques strictement nécessaires à son fonctionnement (panier, session de connexion). Aucun cookie publicitaire ou de traçage tiers n'est déposé sans consentement préalable.</p>
<h2>6. Droit applicable</h2>
<p>Les présentes mentions légales sont soumises au droit béninois et aux actes uniformes de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA). En cas de litige, et à défaut de résolution amiable, les tribunaux compétents du Bénin seront seuls compétents.</p>
`.trim();

const DEFAULT_CGV = `
<h2>1. Objet</h2>
<p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre <strong>[Nom de l'entreprise]</strong>, [forme juridique], immatriculée au RCCM sous le n° <strong>[Numéro RCCM]</strong>, IFU n° <strong>[Numéro IFU]</strong>, dont le siège social est situé au <strong>[Adresse complète]</strong> (ci-après « la Boutique »), et toute personne physique ou morale souhaitant procéder à un achat via le présent site (ci-après « le Client »).</p>
<h2>2. Produits et prix</h2>
<p>Les produits proposés à la vente sont ceux figurant sur le site au jour de la consultation, dans la limite des stocks disponibles. Les prix sont indiqués en [devise, ex : Franc CFA (XOF)], toutes taxes comprises, hors frais de livraison qui sont précisés avant la validation de la commande. La Boutique se réserve le droit de modifier ses prix à tout moment, les produits étant facturés sur la base du tarif en vigueur au moment de la validation de la commande.</p>
<h2>3. Commande</h2>
<p>La commande est passée directement sur le site. Le Client sélectionne les articles souhaités (taille, couleur), les ajoute au panier puis valide sa commande en renseignant ses coordonnées. La confirmation de commande vaut acceptation des présentes CGV.</p>
<h2>4. Paiement</h2>
<p>Le paiement s'effectue en ligne, au moment de la commande, via les moyens de paiement proposés sur le site (Mobile Money, carte bancaire), traités par un prestataire de paiement tiers sécurisé. La Boutique ne collecte ni ne conserve aucune donnée de paiement. La commande n'est considérée comme définitive qu'après confirmation du paiement par le prestataire.</p>
<h2>5. Livraison</h2>
<p>Les commandes sont livrées à l'adresse indiquée par le Client lors de la commande, dans un délai indicatif de <strong>[Délai de livraison, ex : 2 à 5 jours ouvrés]</strong> selon la zone de livraison. Les frais de livraison sont précisés avant validation de la commande. La Boutique livre actuellement : <strong>[zones de livraison, ex : Cotonou et environs, Côte d'Ivoire]</strong>.</p>
<h2>6. Droit de rétractation et retours</h2>
<p>Le Client dispose d'un délai de <strong>[Délai, ex : 7 jours]</strong> à compter de la réception du produit pour demander un échange ou un retour, à condition que l'article soit retourné dans son état d'origine, non porté et avec ses étiquettes. Les frais de retour sont à la charge du <strong>[Client / de la Boutique — à préciser]</strong>. Pour initier un retour, le Client contacte <strong>[Adresse e-mail ou numéro de contact]</strong>.</p>
<h2>7. Garanties</h2>
<p>La Boutique garantit la conformité des produits vendus. Tout article défectueux ou non conforme à la commande peut faire l'objet d'un échange ou d'un remboursement, sur présentation d'une preuve d'achat, dans un délai de <strong>[Délai, ex : 14 jours]</strong> après réception.</p>
<h2>8. Responsabilité</h2>
<p>La Boutique ne saurait être tenue responsable des dommages résultant d'une mauvaise utilisation des produits, d'un cas de force majeure, ou de retards de livraison imputables au transporteur.</p>
<h2>9. Données personnelles</h2>
<p>Les données collectées lors de la commande sont nécessaires à son traitement et ne sont transmises qu'aux prestataires impliqués dans son exécution (paiement, livraison). Voir les mentions légales pour plus de détails.</p>
<h2>10. Litiges et droit applicable</h2>
<p>Les présentes CGV sont soumises au droit béninois et aux actes uniformes OHADA. En cas de litige, le Client est invité à contacter la Boutique en priorité pour une résolution amiable, à <strong>[Adresse e-mail de contact]</strong>. À défaut d'accord amiable, les tribunaux compétents du Bénin seront seuls compétents.</p>
<h2>11. Contact</h2>
<p>Pour toute question relative à une commande ou aux présentes CGV : <strong>[Adresse e-mail]</strong> — <strong>[Numéro de téléphone / WhatsApp]</strong>.</p>
`.trim();

const DEFAULTS = {
  storeName: "Mode Shop",
  currency: "XOF" as SupportedCurrency,
  accentColor: "#a67c52",
  heroEyebrow: "Nouvelle collection",
  heroTitle: "Le prêt-à-porter, pensé pour vous",
  heroSubtitle: "Des pièces sélectionnées, livrées depuis Cotonou et Abidjan.",
  heroCtaLabel: "Découvrir la boutique",
  featuredCollectionId: null as string | null,
  featuredCollection: null as {
    id: string;
    name: string;
    slug: string;
    coverImage: string | null;
  } | null,
  socialFacebook: "",
  socialInstagram: "",
  socialTiktok: "",
  socialWhatsapp: "",
  legalMentions: DEFAULT_MENTIONS_LEGALES,
  cgvContent: DEFAULT_CGV,
};

/**
 * Singleton en lecture seule — pas d'ecriture ici (evite un upsert a chaque
 * rendu de page). La ligne n'est creee que via updateStoreSettings (action
 * admin). Tant qu'elle n'existe pas, on retourne les valeurs par defaut.
 */
export async function getStoreSettings() {
  const settings = await db.storeSettings.findUnique({
    where: { id: "default" },
    include: {
      featuredCollection: {
        select: { id: true, name: true, slug: true, coverImage: true },
      },
    },
  });

  if (!settings) return DEFAULTS;

  return {
    ...settings,
    socialFacebook: settings.socialFacebook ?? "",
    socialInstagram: settings.socialInstagram ?? "",
    socialTiktok: settings.socialTiktok ?? "",
    socialWhatsapp: settings.socialWhatsapp ?? "",
    legalMentions: settings.legalMentions ?? DEFAULT_MENTIONS_LEGALES,
    cgvContent: settings.cgvContent ?? DEFAULT_CGV,
  };
}
