import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Remplace les visuels Picsum (aleatoires, sans rapport avec le produit) par
// de vraies photos Unsplash choisies manuellement et verifiees. Met a jour
// les lignes existantes (aucune suppression) pour ne pas casser les
// commandes/variantes deja liees en base.
const PHOTO_IDS: Record<string, string[]> = {
  "eclat-d-ete": ["1562151270-c7d22ceb586a"],
  "soiree-elegance": ["1568251188392-ae32f898cb3b"],
  "robe-portefeuille-soie": [
    "1625367534642-426f8d4f11fd",
    "1668028554553-f83cac89ce0f",
  ],
  "robe-fluide-imprimee": [
    "1609695813802-3c443be34359",
    "1623288516140-47a0a17cec7c",
  ],
  "chemisier-lin": ["1713881676551-b16f22ce4719", "1774005906344-57048d3f5856"],
  "pantalon-large-taille-haute": [
    "1750857739910-81dda820b067",
    "1762343291713-0d7f83e6c2e9",
  ],
  "robe-soiree-sequins": [
    "1772615071600-f107b8c649af",
    "1547697933-66bcb20f114a",
  ],
  "top-asymetrique": [
    "1743015494938-6cd8672f9bdd",
    "1678816922616-f3524ac4b6d3",
  ],
  "sac-main-structure": [
    "1614179689702-355944cd0918",
    "1605733513597-a8f8341084e6",
  ],
  "foulard-soie-imprime": [
    "1777795530497-205664bbd965",
    "1768744326593-50f2c9ad0d53",
  ],
  "blazer-oversize": [
    "1730715145729-bf929994c328",
    "1616715623022-65d18f0042ae",
  ],
};

function photoUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=900&h=1150&fit=crop&q=80`;
}

async function main() {
  const collections = await db.collection.findMany();
  for (const collection of collections) {
    const id = PHOTO_IDS[collection.slug]?.[0];
    if (!id) continue;
    await db.collection.update({
      where: { id: collection.id },
      data: { coverImage: photoUrl(id) },
    });
    console.log(`  ✔ collection ${collection.slug}`);
  }

  const products = await db.product.findMany({
    include: { images: { orderBy: { position: "asc" } } },
  });

  for (const product of products) {
    const ids = PHOTO_IDS[product.slug];
    if (!ids) {
      console.log(`  ⚠ pas de photo configurée pour "${product.slug}", ignoré`);
      continue;
    }

    for (const [i, imageRow] of product.images.entries()) {
      const id = ids[i] ?? ids[0];
      await db.productImage.update({
        where: { id: imageRow.id },
        data: { url: photoUrl(id) },
      });
    }
    console.log(`  ✔ produit ${product.slug} (${product.images.length} image(s))`);
  }

  console.log("Images corrigées.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
