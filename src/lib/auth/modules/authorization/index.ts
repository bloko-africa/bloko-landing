import { admin } from "better-auth/plugins";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const authorizationPlugins = [
  admin({
    ac,
    roles,
    // Toute inscription (storefront ou /admin/auth/sign-up) obtient "customer"
    // par defaut : aucun acces back-office. Les comptes staff sont promus
    // manuellement (viewer/editor/admin) apres verification.
    defaultRole: "customer",
    adminRole: "admin",
  }),
];

export const authorizationClient = [adminClient()];
