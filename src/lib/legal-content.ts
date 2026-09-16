// Contenu légal FIXE de la plateforme Bloko elle-même — distinct du contenu
// légal par boutique (Boutique.legalMentions / cgvContent, éditable par
// l'admin depuis /2558588dca9a/boutiques/[id]). Bloko est un intermédiaire
// technique qui met en relation des vendeuses indépendantes et des
// acheteurs : elle n'est ni le vendeur, ni le transporteur des produits
// vendus sur les boutiques qu'elle héberge. Remplace les [crochets] par les
// vraies informations de l'entreprise avant mise en production — ce texte
// est une base structurée, pas un avis juridique : à faire relire par un
// avocat avant lancement réel, en particulier vu que de l'argent réel
// transite par la plateforme (GeniusPay).

export const PLATFORM_MENTIONS_LEGALES = `
<h2>1. Éditeur de la plateforme</h2>
<p>La plateforme Bloko est éditée par : <strong>EazySell BJ</strong>, Entreprise Individuelle, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>RB/PNO/25 A 111988</strong>, Identifiant Fiscal Unique (IFU) n° <strong>0202387507389</strong>, dont le siège social est situé Îlot 1781, Parcelle D, Tokpota Davo, 5ème arrondissement, <strong>Porto-Novo, Bénin</strong>.</p>
<p>Numéro de téléphone : <strong>+229 01 67 26 63 60</strong><br>Adresse e-mail : <strong>eazysell.bj@gmail.com</strong></p>
<p>Directeur de la publication : <strong>François Mawuto Aboudou ZINSOU</strong></p>

<h2>2. Nature de l'activité</h2>
<p>Bloko est une plateforme technique de mise en relation (marketplace) permettant à des vendeuses indépendantes de créer une boutique en ligne, présenter leurs produits et recevoir des commandes, et à des acheteurs de commander directement auprès de ces vendeuses. <strong>Bloko n'est pas le vendeur des produits proposés sur les boutiques qu'elle héberge</strong> : chaque boutique est exploitée sous la responsabilité de la vendeuse qui l'a créée, qui reste seule responsable de ses produits, de leurs descriptions, de leur conformité et de leur prix. Les conditions générales de vente propres à chaque boutique sont consultables sur la page de la boutique concernée.</p>

<h2>3. Hébergement et prestataires techniques</h2>
<p>L'application est hébergée et déployée par Vercel Inc. La base de données est hébergée par Prisma Data Platform (Prisma Postgres). Les fichiers et images sont hébergés par UploadThing. Les paiements sont traités par GeniusPay, prestataire de services de paiement tiers indépendant de Bloko — voir l'article 5 des <a href="/cgu">Conditions Générales d'Utilisation</a>.</p>

<h2>4. Propriété intellectuelle</h2>
<p>Le nom « Bloko », son logo, sa charte graphique, son code source et l'ensemble des éléments propres à la plateforme (hors contenu publié par chaque vendeuse sur sa propre boutique) sont protégés par le droit d'auteur et demeurent la propriété exclusive de <strong>EazySell BJ</strong>. Toute reproduction ou exploitation non autorisée est interdite.</p>

<h2>5. Données personnelles</h2>
<p>Les données collectées (comptes vendeuses, comptes acheteurs, commandes) sont traitées conformément à la loi béninoise n°2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin, sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP). Voir l'article 8 des <a href="/cgu">Conditions Générales d'Utilisation</a> pour le détail des droits d'accès, de rectification et de suppression.</p>

<h2>6. Droit applicable</h2>
<p>Les présentes mentions légales sont soumises au droit béninois et aux actes uniformes de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA). En cas de litige, et à défaut de résolution amiable, les tribunaux compétents du Bénin seront seuls compétents.</p>
`.trim();

// Modèles par défaut proposés à une vendeuse à la création de sa boutique
// (éditables ensuite depuis /2558588dca9a/boutiques/[id]) — adaptés au fait
// qu'elle vend en tant que commerçante indépendante via la plateforme
// Bloko, dont les propres règles (paiement, livraison, responsabilité de
// l'intermédiaire) sont dans les CGU de la plateforme, pas répétées ici.
export const DEFAULT_BOUTIQUE_MENTIONS_LEGALES = `
<h2>1. Identification de la vendeuse</h2>
<p>Cette boutique est exploitée par : <strong>[Nom de la vendeuse / de l'entreprise]</strong>, [forme juridique le cas échéant — ex : Entreprise Individuelle], [RCCM/IFU si applicable], basée à <strong>[Ville]</strong>.</p>
<p>Contact : <strong>[Numéro de téléphone / WhatsApp]</strong> — <strong>[Adresse e-mail]</strong></p>
<h2>2. Statut</h2>
<p>Cette boutique est hébergée par la plateforme Bloko, qui agit uniquement comme intermédiaire technique. La vendeuse est seule responsable des produits proposés, de leurs descriptions et de leur conformité. Voir les <a href="/mentions-legales">mentions légales de Bloko</a> pour le rôle de la plateforme.</p>
<h2>3. Propriété intellectuelle</h2>
<p>Les photos, descriptions et contenus propres à cette boutique appartiennent à <strong>[Nom de la vendeuse]</strong>, sauf mention contraire.</p>
`.trim();

export const DEFAULT_BOUTIQUE_CGV = `
<h2>1. Objet</h2>
<p>Les présentes conditions générales de vente régissent les achats effectués auprès de <strong>[Nom de la vendeuse]</strong> (« la Vendeuse ») via sa boutique sur la plateforme Bloko. La Vendeuse est seule partie au contrat de vente ; Bloko n'intervient qu'en tant qu'intermédiaire technique (voir les <a href="/cgu">CGU de Bloko</a>).</p>
<h2>2. Produits et prix</h2>
<p>Les produits proposés sont ceux figurant sur la boutique au jour de la consultation, dans la limite des stocks disponibles. Les prix sont indiqués en <strong>[devise]</strong>, hors frais de livraison précisés avant validation de la commande.</p>
<h2>3. Commande et paiement</h2>
<p>La commande est passée directement sur la boutique. Le paiement s'effectue en ligne via le prestataire de paiement de la plateforme (GeniusPay). La commande est définitive après confirmation du paiement.</p>
<h2>4. Livraison</h2>
<p>Les commandes sont livrées par une agence de livraison partenaire, dans un délai indicatif de <strong>[Délai, ex : 2 à 5 jours ouvrés]</strong>. Zones livrées : <strong>[zones, ex : Cotonou et environs]</strong>.</p>
<h2>5. Retours et garanties</h2>
<p>La Vendeuse accepte les retours dans un délai de <strong>[Délai, ex : 7 jours]</strong> après réception, pour un article non porté et avec ses étiquettes. Tout article défectueux ou non conforme peut faire l'objet d'un échange ou remboursement sur présentation d'une preuve d'achat.</p>
<h2>6. Contact</h2>
<p>Pour toute question sur une commande : <strong>[E-mail]</strong> — <strong>[Téléphone / WhatsApp]</strong>.</p>
`.trim();

export const PLATFORM_CGU = `
<h2>1. Objet</h2>
<p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Bloko, éditée par <strong>EazySell BJ</strong> (ci-après « Bloko » ou « la Plateforme »), par toute vendeuse créant et exploitant une boutique (ci-après « la Vendeuse »), ainsi que par toute personne effectuant un achat sur une boutique hébergée par la Plateforme (ci-après « l'Acheteur »). L'utilisation de la Plateforme, en tant que Vendeuse ou Acheteur, implique l'acceptation pleine et entière des présentes CGU.</p>

<h2>2. Rôle de Bloko — plateforme d'intermédiation, pas vendeur</h2>
<p>Bloko fournit une infrastructure technique : hébergement de boutiques en ligne, outils de gestion de catalogue et de commandes, mise en relation avec des prestataires de paiement et de livraison, et un espace de découverte permettant aux Acheteurs de trouver une boutique par son identifiant (« handle ») ou de parcourir les produits publiés. <strong>Bloko n'achète, ne stocke, ne fabrique et ne vend elle-même aucun des produits proposés sur les boutiques.</strong> Chaque vente conclue sur la Plateforme constitue un contrat direct entre la Vendeuse et l'Acheteur ; Bloko n'est partie à aucun de ces contrats.</p>

<h2>3. Statut et responsabilités de la Vendeuse</h2>
<p>Chaque Vendeuse exploite sa boutique de façon indépendante et est seule responsable : de l'exactitude des descriptions, prix, photos et stocks de ses produits ; du respect de la réglementation applicable à son activité commerciale (y compris, le cas échéant, son immatriculation RCCM/IFU) ; de la conformité et de la qualité des produits vendus ; et de ses propres conditions générales de vente, consultables sur sa page boutique. La création d'un compte Vendeuse est réalisée par l'équipe Bloko lors de l'intégration ; la Vendeuse s'engage à ne proposer que des produits licites et à ne pas utiliser la Plateforme à des fins frauduleuses.</p>

<h2>4. Suspension et résiliation d'une boutique</h2>
<p>Bloko se réserve le droit de suspendre ou de clôturer, à tout moment et sans préavis en cas de manquement grave (produit illicite, fraude, non-respect des présentes CGU), l'accès d'une Vendeuse à la Plateforme. Une boutique suspendue disparaît de l'espace public mais ses données (commandes passées, historique) sont conservées.</p>

<h2>5. Paiement</h2>
<p>Les paiements effectués sur la Plateforme sont traités par GeniusPay, prestataire de services de paiement tiers, indépendant de Bloko. Bloko ne collecte ni ne conserve aucune donnée de carte bancaire ou de Mobile Money. La confirmation d'une commande est subordonnée à la confirmation du paiement par GeniusPay. En cas d'incident de paiement, l'Acheteur et la Vendeuse peuvent être invités à se rapprocher du support Bloko pour faciliter la résolution, sans que cela n'engage la responsabilité de Bloko en tant que partie au contrat de vente.</p>

<h2>6. Livraison</h2>
<p>La livraison des commandes est assurée par des agences de livraison partenaires, prestataires indépendants sélectionnés pour chaque commande. Bloko met à disposition un outil de suivi de statut de livraison renseigné par la Vendeuse ou l'agence, mais <strong>n'exécute elle-même aucune livraison</strong>. En cas de retard, perte ou dommage imputable à l'agence de livraison, la responsabilité de Bloko ne saurait être engagée au-delà de son rôle d'outil de suivi ; l'Acheteur conserve ses droits vis-à-vis de la Vendeuse au titre de son obligation de livraison conforme.</p>

<h2>7. Limitation de responsabilité de la Plateforme</h2>
<p>Bloko s'efforce d'assurer la disponibilité et le bon fonctionnement de la Plateforme, sans obligation de résultat. Bloko ne saurait être tenue responsable des dommages résultant : d'une interruption temporaire du service, d'un contenu publié par une Vendeuse, d'un défaut de conformité d'un produit, ou d'une défaillance d'un prestataire tiers (paiement, livraison, hébergement). Cette limitation ne s'applique pas en cas de faute lourde ou intentionnelle de Bloko.</p>

<h2>8. Données personnelles</h2>
<p>Les données collectées (identité, contact, adresse de livraison, historique de commandes) sont utilisées pour le fonctionnement de la Plateforme : création de compte, traitement des commandes, suivi de livraison, communication liée au service. Conformément à la loi béninoise n°2017-20 du 20 avril 2018 portant Code du numérique et sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP), toute personne dispose d'un droit d'accès, de rectification et de suppression de ses données, exerçable en écrivant à <strong>eazysell.bj@gmail.com</strong>. Une Vendeuse a accès aux données des Acheteurs strictement nécessaires au traitement de ses propres commandes.</p>

<h2>9. Propriété intellectuelle</h2>
<p>La marque « Bloko », son logo et le logiciel de la Plateforme sont la propriété exclusive de <strong>EazySell BJ</strong>. Chaque Vendeuse conserve la propriété des contenus (textes, photos) qu'elle publie sur sa boutique et garantit disposer des droits nécessaires à leur publication.</p>

<h2>10. Modification des CGU</h2>
<p>Bloko peut modifier les présentes CGU à tout moment ; la version en vigueur est celle publiée sur cette page à la date de connexion.</p>

<h2>11. Droit applicable et litiges</h2>
<p>Les présentes CGU sont soumises au droit béninois et aux actes uniformes OHADA. En cas de litige, une résolution amiable sera recherchée en priorité en contactant <strong>eazysell.bj@gmail.com</strong>. À défaut, les tribunaux compétents du Bénin seront seuls compétents.</p>

<h2>12. Contact</h2>
<p>Pour toute question relative à la Plateforme : <strong>eazysell.bj@gmail.com</strong> — <strong>+229 01 67 26 63 60</strong>.</p>
`.trim();
