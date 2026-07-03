import { admin } from "better-auth/plugins";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const authorizationPlugins = [
  admin({
    ac,
    roles,
    // Toute inscription via /compte/inscription obtient "customer" par defaut :
    // aucun acces back-office. Il n'y a pas d'auto-inscription admin — les
    // comptes staff (viewer/editor/admin) sont promus manuellement en base.
    defaultRole: "customer",
    adminRole: "admin",
  }),
];

export const authorizationClient = [adminClient()];
