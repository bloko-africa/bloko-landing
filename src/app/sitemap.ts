import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bloko.me";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [boutiques, products] = await Promise.all([
    db.boutique.findMany({
      where: { status: "ACTIVE" },
      select: { handle: true, updatedAt: true },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED", boutique: { status: "ACTIVE" } },
      select: { slug: true, updatedAt: true, boutique: { select: { handle: true } } },
      take: 5000, // plafond sitemap.xml (Google) — largement suffisant à cette échelle
    }),
  ]);

  return [
    { url: APP_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${APP_URL}/decouvrir`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${APP_URL}/pourquoi-bloko`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/cgu`, changeFrequency: "yearly", priority: 0.2 },
    ...boutiques.map((b) => ({
      url: `${APP_URL}/b/${b.handle}`,
      lastModified: b.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${APP_URL}/b/${p.boutique.handle}/produits/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
