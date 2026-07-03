"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";

export type SearchResult = {
  type: "product" | "order" | "collection" | "category";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  await requireRole(["viewer", "editor", "admin"]);

  const q = query.trim();
  if (q.length < 2) return [];

  const [products, orders, collections, categories] = await Promise.all([
    db.product.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, status: true },
    }),
    db.order.findMany({
      where: {
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
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, season: true },
    }),
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
      href: `/admin/products/${p.id}`,
    })),
    ...orders.map((o) => ({
      type: "order" as const,
      id: o.id,
      title: o.reference,
      subtitle: `${o.customerName} — ${o.status}`,
      href: `/admin/orders/${o.id}`,
    })),
    ...collections.map((c) => ({
      type: "collection" as const,
      id: c.id,
      title: c.name,
      subtitle: c.season ?? "Collection",
      href: `/admin/collections/${c.id}`,
    })),
    ...categories.map((c) => ({
      type: "category" as const,
      id: c.id,
      title: c.name,
      subtitle: "Catégorie",
      href: `/admin/categories/${c.id}`,
    })),
  ];
}
