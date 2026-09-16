/**
 * Plan unique payant : Bloko prélève une commission sur le sous-total
 * articles de chaque commande payée (jamais sur les frais de livraison —
 * voir wallet.ts). Le taux couvre les frais GeniusPay (~4,2-4,5% en
 * Mobile Money, jusqu'à 6% en carte) avec une marge réelle, cohérent
 * avec les commissions Jumia Bénin en mode/prêt-à-porter (8-15%).
 */
export const PLATFORM_COMMISSION_RATE = 0.08;
