// Libellés/couleurs de LivraisonStatus partagés entre l'admin (liste et
// détail livraison/commande) et les pages de suivi acheteur — une seule
// source pour ne pas désynchroniser les libellés entre les deux publics.
export const LIVRAISON_STATUS_LABEL: Record<string, string> = {
  A_ASSIGNER: "À assigner",
  PRISE_EN_CHARGE: "Prise en charge",
  EN_ROUTE: "En route",
  LIVREE: "Livrée",
  ECHEC: "Échec",
  RETOUR: "Retour",
};

export const LIVRAISON_STATUS_STYLE: Record<string, string> = {
  A_ASSIGNER: "bg-yellow-light-4 text-yellow-dark-2",
  PRISE_EN_CHARGE: "bg-blue-light-5 text-blue-dark",
  EN_ROUTE: "bg-blue-light-5 text-blue-dark",
  LIVREE: "bg-green-light-6 text-green-dark",
  ECHEC: "bg-red-light-5 text-red-dark",
  RETOUR: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
};

// Ordre d'affichage pour une timeline simple côté acheteur — RETOUR/ECHEC
// sont des branches, pas des étapes de la progression normale.
export const LIVRAISON_TIMELINE_STEPS = [
  "A_ASSIGNER",
  "PRISE_EN_CHARGE",
  "EN_ROUTE",
  "LIVREE",
] as const;
