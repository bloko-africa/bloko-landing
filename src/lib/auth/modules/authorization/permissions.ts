import { createAccessControl } from "better-auth/plugins/access";

// Passer un `ac`/`roles` personnalisé au plugin admin de Better Auth
// REMPLACE entièrement son schéma de permissions par défaut — y compris
// pour ses propres endpoints internes (listUsers, setRole, banUser,
// createUser...), qui vérifient des actions précises ("list", "set-role",
// "ban", etc., voir better-auth/dist/plugins/admin/access/statement.mjs).
// Le "user" ci-dessous est donc l'union de nos propres actions applicatives
// (read/update:own/update:any/delete, jamais vérifiées ailleurs que via ce
// module — requireRole/requireBoutiqueAccess ne passent pas par cette AC)
// ET des actions attendues par le plugin lui-même. Sans cette union, ces
// endpoints échouent silencieusement en FORBIDDEN pour toute session admin
// réelle, même si la page qui les appelle s'affiche sans erreur apparente.
export const ac = createAccessControl({
  user: [
    "read",
    "update:own",
    "update:any",
    "delete",
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  content: ["read", "create", "update", "delete"],
  settings: ["read", "update"],
  adminPanel: ["access"],
  session: ["list", "revoke", "delete"],
});

export const roles = {
  // Compte boutique cote storefront : aucun droit sur le back-office.
  customer: ac.newRole({}),

  viewer: ac.newRole({
    user: ["read"],
    content: ["read"],
  }),

  editor: ac.newRole({
    user: ["read", "update:own"],
    content: ["read", "create", "update"],
  }),

  // Compte vendeuse (Bloko) : mêmes droits de contenu qu'editor, mais
  // toujours restreint à sa propre boutique par requireBoutiqueAccess() —
  // pas de delete, comme editor (delete reste admin-only partout).
  vendeur: ac.newRole({
    user: ["read", "update:own"],
    content: ["read", "create", "update"],
  }),

  admin: ac.newRole({
    user: [
      "read",
      "update:own",
      "update:any",
      "delete",
      "create",
      "list",
      "set-role",
      "ban",
      "impersonate",
      "impersonate-admins",
      "set-password",
      "set-email",
      "get",
      "update",
    ],
    content: ["read", "create", "update", "delete"],
    settings: ["read", "update"],
    adminPanel: ["access"],
    session: ["list", "revoke", "delete"],
  }),
} as const;

export type AppRole = keyof typeof roles;
