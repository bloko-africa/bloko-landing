"use server";

import { db } from "@/lib/db";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { getDashboardBase } from "@/lib/dashboard-space";

export type SearchResult = {
  type: "product" | "order" | "collection" | "category";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const { session, scopedBoutiqueId } = await requireBoutiqueAccess([
    "viewer",
    "editor",
    "admin",
    "vendeur",
  ]);
  const dashboardBase = getDashboardBase((session.user as { role?: string }).role);

  const q = query.trim();
  if (q.length < 2) return [];

  const [products, orders, collections, categories] = await Promise.all([
    db.product.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        boutiqueId: scopedBoutiqueId,
      },
      take: 5,
      select: { id: true, name: true, status: true },
    }),
    db.order.findMany({
      where: {
        boutiqueId: scopedBoutiqueId,
        OR: [
          { reference: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
          { customerPhone: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, reference: true, customerName: true, status: true },
    }),
    db.collection.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        boutiqueId: scopedBoutiqueId,
      },
      take: 5,
      select: { id: true, name: true, season: true },
    }),
    // Categorie = taxonomie globale, non scopee par boutique.
    db.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true },
    }),
  ]);

  return [
    ...products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      subtitle: p.status,
      href: `${dashboardBase}/products/${p.id}`,
    })),
    ...orders.map((o) => ({
      type: "order" as const,
      id: o.id,
      title: o.reference,
      subtitle: `${o.customerName} — ${o.status}`,
      href: `${dashboardBase}/orders/${o.id}`,
    })),
    ...collections.map((c) => ({
      type: "collection" as const,
      id: c.id,
      title: c.name,
      subtitle: c.season ?? "Collection",
      href: `${dashboardBase}/collections/${c.id}`,
    })),
    ...categories.map((c) => ({
      type: "category" as const,
      id: c.id,
      title: c.name,
      subtitle: "Catégorie",
      href: `${dashboardBase}/categories/${c.id}`,
    })),
  ];
}
