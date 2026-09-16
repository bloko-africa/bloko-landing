import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "../_components/product-form";
import { ProductImages } from "../_components/product-images";
import { ProductVariants } from "../_components/product-variants";

export const metadata: Metadata = {
  title: "Modifier produit",
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { createdAt: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) notFound();

  await requireBoutiqueAccess(
    ["viewer", "editor", "admin", "vendeur"],
    product.boutiqueId,
  );

  const [collections, categories] = await Promise.all([
    db.collection.findMany({
      where: { boutiqueId: product.boutiqueId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-270 space-y-8">
      <Breadcrumb pageName={product.name} />

      <ProductForm
        collections={collections.map((c) => ({ value: c.id, label: c.name }))}
        categories={categories.map((c) => ({ value: c.id, label: c.name }))}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          basePrice: product.basePrice.toString(),
          status: product.status,
          collectionId: product.collectionId,
          categoryId: product.categoryId,
        }}
        canDelete
      />

      <ProductVariants
        productId={product.id}
        variants={product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
          priceOverride: v.priceOverride?.toString() ?? null,
        }))}
      />

      <ProductImages productId={product.id} images={product.images} />
    </div>
  );
}
