"use server";

import { db } from "@/lib/db";

export type BlokoSearchResult = {
  type: "boutique" | "product";
  href: string;
  title: string;
  subtitle: string;
  image: string | null;
};

/**
 * Recherche publique (pas de requireRole, contrairement à globalSearch qui
 * reste staff-only) : alimente la barre de recherche de l'accueil Bloko
 * (direction A) et le rendu de /decouvrir — cherche par handle de boutique
 * ou par nom de produit, uniquement sur ce qui est publiquement visible
 * (boutique ACTIVE, produit PUBLISHED).
 */
export async function searchBloko(query: string): Promise<BlokoSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [boutiques, products] = await Promise.all([
    db.boutique.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { handle: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { handle: true, displayName: true, logoUrl: true },
    }),
    db.product.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        status: "PUBLISHED",
        boutique: { status: "ACTIVE" },
      },
      take: 8,
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        boutique: { select: { handle: true } },
      },
    }),
  ]);

  return [
    ...boutiques.map((b) => ({
      type: "boutique" as const,
      href: `/b/${b.handle}`,
      title: b.displayName,
      subtitle: `@${b.handle}`,
      image: b.logoUrl,
    })),
    ...products.map((p) => ({
      type: "product" as const,
      href: `/b/${p.boutique.handle}/produits/${p.slug}`,
      title: p.name,
      subtitle: `@${p.boutique.handle}`,
      image: p.images[0]?.url ?? null,
    })),
  ];
}
