import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "./_components/product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { name: true },
  });
  return { title: product?.name ?? "Produit" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
      collection: { select: { name: true, slug: true } },
    },
  });

  if (!product) notFound();

  return (
    <ProductDetail
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        collectionName: product.collection?.name ?? null,
        images: product.images.map((i) => ({ id: i.id, url: i.url })),
        variants: product.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          unitPrice: Number(v.priceOverride ?? product.basePrice),
        })),
      }}
    />
  );
}
