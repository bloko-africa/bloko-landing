import { ProductCard } from "@/components/Storefront/product-card";
import { db } from "@/lib/db";
import { getBoutiqueByHandle } from "@/lib/boutique";
import { stripHtml } from "@/lib/strip-html";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "./_components/product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}): Promise<Metadata> {
  const { handle, slug } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) return { title: "Produit" };
  const product = await db.product.findFirst({
    where: { slug, boutiqueId: boutique.id, status: "PUBLISHED" },
    select: { name: true, description: true, images: { take: 1, orderBy: { position: "asc" } } },
  });
  if (!product) return { title: "Produit" };

  const title = `${product.name} — ${boutique.displayName}`;
  const description = product.description
    ? stripHtml(product.description)
    : `${product.name}, disponible sur la boutique ${boutique.displayName} sur Bloko.`;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) {
  const { handle, slug } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) notFound();

  const product = await db.product.findFirst({
    where: { slug, boutiqueId: boutique.id, status: "PUBLISHED" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
      collection: { select: { name: true, slug: true } },
    },
  });

  if (!product) notFound();

  const relatedFilters = [
    product.collectionId ? { collectionId: product.collectionId } : null,
    product.categoryId ? { categoryId: product.categoryId } : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  const related =
    relatedFilters.length === 0
      ? []
      : await db.product.findMany({
          where: {
            boutiqueId: boutique.id,
            status: "PUBLISHED",
            id: { not: product.id },
            OR: relatedFilters,
          },
          take: 4,
          orderBy: { createdAt: "desc" },
          include: {
            images: { orderBy: { position: "asc" }, take: 1 },
            variants: {
              select: { id: true, size: true, color: true, stock: true, priceOverride: true },
            },
          },
        });

  return (
    <>
      <ProductDetail
        currency={boutique.currency}
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

      {related.length > 0 && (
        <section className="mx-auto max-w-(--breakpoint-2xl) border-t border-stroke px-4 py-16 dark:border-dark-3 md:px-8">
          <h2 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
            Vous aimerez aussi
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                image={p.images[0]?.url ?? null}
                basePrice={Number(p.basePrice)}
                currency={boutique.currency}
                variants={p.variants.map((v) => ({
                  id: v.id,
                  size: v.size,
                  color: v.color,
                  stock: v.stock,
                  unitPrice: Number(v.priceOverride ?? p.basePrice),
                }))}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
