/**
 * Plan unique payant : Bloko prélève une commission sur le sous-total
 * articles de chaque commande payée (jamais sur les frais de livraison —
 * voir wallet.ts). Le taux couvre les frais GeniusPay (~4,2-4,5% en
 * Mobile Money, jusqu'à 6% en carte) avec une marge réelle, cohérent
 * avec les commissions Jumia Bénin en mode/prêt-à-porter (8-15%).
 */
export const PLATFORM_COMMISSION_RATE = 0.08;

/**
 * Estimation du coût moyen GeniusPay pour Bloko (pas une valeur exacte —
 * GeniusPay ne renvoie pas le détail des frais par transaction dans le
 * webhook). Basé sur le rail dominant au Bénin, Mobile Money via PawaPay
 * (~3,2% opérateur + 1% + 100 XOF GeniusPay), utilisé uniquement pour
 * afficher un bénéfice estimé au tableau de bord admin.
 */
export const ESTIMATED_GENIUSPAY_COST_RATE = 0.045;

/**
 * Prix effectivement payé par le client. Quand la vendeuse choisit de
 * répercuter la commission (Boutique.passCommissionToClient), le prix est
 * majoré par division (pas +8%) : c'est ce qui garantit qu'après la
 * commission de 8% prélevée sur ce montant majoré, la vendeuse touche
 * exactement son prix listé — pas 8% de moins que prévu.
 *
 * Exemple : prix listé 1000 XOF → client paie 1087 XOF → commission 8% de
 * 1087 = 87 XOF → la vendeuse touche 1087 - 87 = 1000 XOF net, son prix
 * listé exact.
 */
export function getBuyerPrice(listedPrice: number, passCommissionToClient: boolean): number {
  if (!passCommissionToClient) return listedPrice;
  return Math.round(listedPrice / (1 - PLATFORM_COMMISSION_RATE));
}
