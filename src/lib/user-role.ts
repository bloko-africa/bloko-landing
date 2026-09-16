export const USER_ROLE_LABEL: Record<string, string> = {
  customer: "Cliente",
  viewer: "Lecture seule",
  editor: "Éditeur",
  vendeur: "Vendeuse",
  admin: "Administrateur",
};

// Rôles assignables depuis la page Équipe — jamais "vendeur" (géré via
// createBoutique, qui lie atomiquement le rôle et le boutiqueId) ni
// "customer" (rôle par défaut auto-attribué, pas une cible manuelle).
export const ASSIGNABLE_STAFF_ROLES = ["viewer", "editor", "admin"] as const;
