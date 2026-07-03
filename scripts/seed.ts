import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function image(seed: string) {
  return `https://picsum.photos/seed/${seed}/900/1150`;
}

async function main() {
  console.log("Nettoyage du catalogue existant...");
  await db.product.deleteMany();
  await db.collection.deleteMany();
  await db.category.deleteMany();

  console.log("Création des collections...");
  const ete = await db.collection.create({
    data: {
      name: "Éclat d'Été",
      slug: "eclat-d-ete",
      season: "Été 2026",
      description: "Des matières légères et des coupes fluides pour la saison chaude.",
      coverImage: image("collection-ete"),
      isActive: true,
    },
  });

  const soiree = await db.collection.create({
    data: {
      name: "Soirée Élégance",
      slug: "soiree-elegance",
      season: "Collection permanente",
      description: "Des pièces qui font une entrée remarquée.",
      coverImage: image("collection-soiree"),
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
    const product = await db.product.create({ data: productData });

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
        { productId: product.id, url: image(`${product.slug}-1`), position: 0 },
        { productId: product.id, url: image(`${product.slug}-2`), position: 1 },
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
