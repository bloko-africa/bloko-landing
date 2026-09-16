import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { auth } from "../src/lib/auth";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Bootstrap du tout premier compte admin plateforme — nécessaire une seule
// fois sur une base fraîche, avant de pouvoir se connecter à /admin ou de
// lancer scripts/seed.ts (qui a besoin d'un admin comme owner de la
// boutique de démo). Passe par auth.api.createUser (comme createBoutique())
// plutôt qu'un insert direct, pour que le hash du mot de passe soit celui
// que Better Auth attend au sign-in.
const EMAIL = process.env.ADMIN_EMAIL || "admin@bloko.test";
const PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMoi123!";
const NAME = process.env.ADMIN_NAME || "Admin Bloko";

async function main() {
  const existing = await db.user.findFirst({ where: { role: "admin" } });
  if (existing) {
    console.log(`Un admin existe déjà : ${existing.email}`);
    return;
  }

  const { user } = await auth.api.createUser({
    body: { email: EMAIL, password: PASSWORD, name: NAME, role: "admin" },
  });

  console.log(`Admin créé : ${user.email} / mot de passe : ${PASSWORD}`);
  console.log("Connexion : /admin/auth/sign-in");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
