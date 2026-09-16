import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Photos Unsplash choisies manuellement par produit (verifiees, gratuites) —
// remplace les visuels aleatoires Picsum qui ne correspondaient a rien.
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
  "chemisier-lin": [
    "1713881676551-b16f22ce4719",
    "1774005906344-57048d3f5856",
  ],
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

function image(seed: string, index = 0) {
  const ids = PHOTO_IDS[seed];
  const id = ids?.[index] ?? ids?.[0];
  if (!id) throw new Error(`Pas de photo Unsplash configurée pour "${seed}"`);
  return `https://images.unsplash.com/photo-${id}?w=900&h=1150&fit=crop&q=80`;
}

async function main() {
  // Depuis le passage multi-boutique, Product/Collection sont rattachés à
  // une Boutique — ce seed reconstitue le catalogue "mode-shop" d'origine
  // (même boutique par défaut que prisma/seed-default-boutique.ts).
  const owner = await db.user.findFirst({ where: { role: "admin" }, orderBy: { createdAt: "asc" } });
  if (!owner) {
    throw new Error(
      "Aucun compte admin trouvé — crée un compte admin avant de lancer ce seed (il devient owner de la boutique de démo).",
    );
  }
  const boutique = await db.boutique.upsert({
    where: { handle: "mode-shop" },
    update: {},
    create: {
      handle: "mode-shop",
      displayName: "Mode Shop",
      status: "ACTIVE",
      ownerId: owner.id,
      ville: "Cotonou",
    },
  });

  console.log("Nettoyage du catalogue existant...");
  await db.product.deleteMany({ where: { boutiqueId: boutique.id } });
  await db.collection.deleteMany({ where: { boutiqueId: boutique.id } });
  await db.category.deleteMany();

  console.log("Création des collections...");
  const ete = await db.collection.create({
    data: {
      boutiqueId: boutique.id,
      name: "Éclat d'Été",
      slug: "eclat-d-ete",
      season: "Été 2026",
      description: "Des matières légères et des coupes fluides pour la saison chaude.",
      coverImage: image("eclat-d-ete"),
      isActive: true,
    },
  });

  const soiree = await db.collection.create({
    data: {
      boutiqueId: boutique.id,
      name: "Soirée Élégance",
      slug: "soiree-elegance",
      season: "Collection permanente",
      description: "Des pièces qui font une entrée remarquée.",
      coverImage: image("soiree-elegance"),
      isActive: true,
    },
  });

  console.log("Création des catégories...");
  const [robes, hauts, pantalons, accessoires] = await Promise.all([
    db.category.create({ data: { name: "Robes", slug: "robes" } }),
    db.category.create({ data: { name: "Hauts", slug: "hauts" } }),
    db.category.create({ data: { name: "Pantalons", slug: "pantalons" } }),
    db.category.create({ data: { name: "Accessoires", slug: "accessoires" } }),
  ]);

  console.log("Création des produits...");

  const products = [
    {
      name: "Robe portefeuille en soie",
      slug: "robe-portefeuille-soie",
      description:
        "Une robe portefeuille en soie doublée, coupe ajustée à la taille et jupe fluide. Se porte du bureau au dîner.",
      basePrice: 32000,
      status: "PUBLISHED" as const,
      collectionId: ete.id,
      categoryId: robes.id,
      variants: [
        { size: "S", color: "Noir", colorHex: "#141414", stock: 6 },
        { size: "M", color: "Noir", colorHex: "#141414", stock: 8 },
        { size: "L", color: "Noir", colorHex: "#141414", stock: 4 },
        { size: "M", color: "Bordeaux", colorHex: "#6b1f2a", stock: 5 },
      ],
    },
    {
      name: "Robe fluide imprimée",
      slug: "robe-fluide-imprimee",
      description: "Robe longue fluide à motifs, idéale pour les journées ensoleillées.",
      basePrice: 27000,
      status: "PUBLISHED" as const,
      collectionId: ete.id,
      categoryId: robes.id,
      variants: [
        { size: "S", color: "Beige", colorHex: "#d6c7a1", stock: 5 },
        { size: "M", color: "Beige", colorHex: "#d6c7a1", stock: 7 },
        { size: "L", color: "Beige", colorHex: "#d6c7a1", stock: 3 },
      ],
    },
    {
      name: "Chemisier en lin",
      slug: "chemisier-lin",
      description: "Chemisier ample en lin naturel, col ouvert, manches 3/4.",
      basePrice: 18000,
      status: "PUBLISHED" as const,
      collectionId: ete.id,
      categoryId: hauts.id,
      variants: [
        { size: "S", color: "Blanc", colorHex: "#f4f2ef", stock: 10 },
        { size: "M", color: "Blanc", colorHex: "#f4f2ef", stock: 12 },
        { size: "L", color: "Blanc", colorHex: "#f4f2ef", stock: 6 },
      ],
    },
    {
      name: "Pantalon large taille haute",
      slug: "pantalon-large-taille-haute",
      description: "Pantalon large en toile légère, taille haute ceinturée, coupe fluide.",
      basePrice: 22000,
      status: "PUBLISHED" as const,
      collectionId: ete.id,
      categoryId: pantalons.id,
      variants: [
        { size: "36", color: "Kaki", colorHex: "#6b6a4f", stock: 4 },
        { size: "38", color: "Kaki", colorHex: "#6b6a4f", stock: 6 },
        { size: "40", color: "Kaki", colorHex: "#6b6a4f", stock: 3 },
      ],
    },
    {
      name: "Robe de soirée sequins",
      slug: "robe-soiree-sequins",
      description: "Robe moulante entièrement sequinée, dos nu, pour les grandes occasions.",
      basePrice: 45000,
      status: "PUBLISHED" as const,
      collectionId: soiree.id,
      categoryId: robes.id,
      variants: [
        { size: "S", color: "Or", colorHex: "#a67c52", stock: 3 },
        { size: "M", color: "Or", colorHex: "#a67c52", stock: 4 },
        { size: "L", color: "Or", colorHex: "#a67c52", stock: 2 },
      ],
    },
    {
      name: "Top asymétrique",
      slug: "top-asymetrique",
      description: "Top une épaule en crêpe satiné, coupe cintrée.",
      basePrice: 20000,
      status: "PUBLISHED" as const,
      collectionId: soiree.id,
      categoryId: hauts.id,
      variants: [
        { size: "S", color: "Noir", colorHex: "#141414", stock: 5 },
        { size: "M", color: "Noir", colorHex: "#141414", stock: 5 },
      ],
    },
    {
      name: "Sac à main structuré",
      slug: "sac-main-structure",
      description: "Sac à main en cuir végétal, fermoir doré, bandoulière amovible.",
      basePrice: 15000,
      status: "PUBLISHED" as const,
      collectionId: null,
      categoryId: accessoires.id,
      variants: [
        { size: "Unique", color: "Camel", colorHex: "#b08b5f", stock: 7 },
        { size: "Unique", color: "Noir", colorHex: "#141414", stock: 6 },
      ],
    },
    {
      name: "Foulard en soie imprimé",
      slug: "foulard-soie-imprime",
      description: "Foulard carré en soie, imprimé exclusif, finitions roulottées main.",
      basePrice: 8000,
      status: "PUBLISHED" as const,
      collectionId: null,
      categoryId: accessoires.id,
      variants: [{ size: "Unique", color: "Multicolore", colorHex: null, stock: 12 }],
    },
    {
      name: "Blazer oversize (brouillon)",
      slug: "blazer-oversize",
      description: "Blazer coupe oversize, épaules structurées — en attente de photos avant publication.",
      basePrice: 30000,
      status: "DRAFT" as const,
      collectionId: ete.id,
      categoryId: hauts.id,
      variants: [{ size: "M", color: "Écru", colorHex: "#e8e5e0", stock: 4 }],
    },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const product = await db.product.create({
      data: { ...productData, boutiqueId: boutique.id },
    });

    await db.productVariant.createMany({
      data: variants.map((v, i) => ({
        productId: product.id,
        sku: `${product.slug.toUpperCase()}-${v.size}-${(v.color ?? "UNI").slice(0, 3).toUpperCase()}-${i}`,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        stock: v.stock,
      })),
    });

    await db.productImage.createMany({
      data: [
        { productId: product.id, url: image(product.slug, 0), position: 0 },
        { productId: product.id, url: image(product.slug, 1), position: 1 },
      ],
    });

    console.log(`  ✔ ${product.name}`);
  }

  console.log("Seed terminé.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
