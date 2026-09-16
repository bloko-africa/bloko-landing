import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Backfill a executer UNE SEULE FOIS, apres la migration
 * `add_boutique_agence_livraison_models` et AVANT `tighten_boutique_id_required` :
 * cree une boutique "par defaut" reprenant les donnees mono-tenant
 * existantes (Product/Collection/Order sans boutique_id), avec l'admin
 * actuel comme owner.
 *
 * Non execute dans cette session (voir consignes de la tache) — a lancer
 * manuellement : `npx tsx scripts/backfill-default-boutique.ts`.
 */
async function main() {
  const admin = await db.user.findFirst({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
  });

  if (!admin) {
    throw new Error(
      "Aucun compte admin trouvé — impossible de désigner un owner pour la boutique par défaut.",
    );
  }

  const existing = await db.boutique.findUnique({ where: { handle: "mode-shop" } });

  const boutique =
    existing ??
    (await db.boutique.create({
      data: {
        handle: "mode-shop",
        displayName: "Mode Shop",
        status: "ACTIVE",
        ownerId: admin.id,
        ville: "Cotonou",
        pays: "Bénin",
      },
    }));

  console.log(`Boutique par défaut : ${boutique.id} (${boutique.handle})`);

  // $executeRaw plutôt que db.product.updateMany({ where: { boutiqueId: null } }) :
  // ce script cible l'état INTERMÉDIAIRE entre les deux migrations (colonne
  // encore nullable), mais le client Prisma généré reflète toujours schema.prisma
  // dans son état FINAL (colonne requise) — `boutiqueId: null` n'y est donc
  // plus un filtre valide côté typage, même si la vraie colonne DB l'est
  // encore à ce stade. Le SQL brut contourne ce décalage proprement.
  const [products, collections, orders] = await Promise.all([
    db.$executeRaw`UPDATE "product" SET "boutique_id" = ${boutique.id} WHERE "boutique_id" IS NULL`,
    db.$executeRaw`UPDATE "collection" SET "boutique_id" = ${boutique.id} WHERE "boutique_id" IS NULL`,
    db.$executeRaw`UPDATE "order" SET "boutique_id" = ${boutique.id} WHERE "boutique_id" IS NULL`,
  ]);

  console.log(
    `Rattachés à ${boutique.handle} : ${products} produits, ${collections} collections, ${orders} commandes.`,
  );
  console.log(
    "Backfill terminé. Tu peux maintenant appliquer la migration tighten_boutique_id_required.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
