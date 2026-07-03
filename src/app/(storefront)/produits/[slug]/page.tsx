import { db } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

  const relatedFilters = [
    product.collectionId ? { collectionId: product.collectionId } : null,
    product.categoryId ? { categoryId: product.categoryId } : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  const related =
    relatedFilters.length === 0
      ? []
      : await db.product.findMany({
          where: {
            status: "PUBLISHED",
            id: { not: product.id },
            OR: relatedFilters,
          },
          take: 4,
          orderBy: { createdAt: "desc" },
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
        });

  return (
    <>
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

      {related.length > 0 && (
        <RelatedProducts
          products={related.map((p) => ({
            slug: p.slug,
            name: p.name,
            basePrice: Number(p.basePrice),
            image: p.images[0]?.url ?? null,
          }))}
        />
      )}
    </>
  );
}

function RelatedProducts({
  products,
}: {
  products: { slug: string; name: string; basePrice: number; image: string | null }[];
}) {
  return (
    <section className="mx-auto max-w-(--breakpoint-2xl) border-t border-stroke px-4 py-16 dark:border-dark-3 md:px-8">
      <h2 className="text-heading-6 font-medium text-dark dark:text-white">
        Vous aimerez aussi
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {products.map((product) => (
          <Link key={product.slug} href={`/produits/${product.slug}`} className="group">
            <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-gray-2 dark:bg-dark-2">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(min-width: 640px) 25vw, 50vw"
                />
              )}
            </div>
            <p className="mt-3 text-body-sm font-medium text-dark dark:text-white">
              {product.name}
            </p>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              {product.basePrice.toLocaleString("fr-FR")} XOF
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
