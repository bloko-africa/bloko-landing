import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { OrderForm } from "../_components/order-form";

export const metadata: Metadata = {
  title: "Nouvelle commande",
};

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const variants = await db.productVariant.findMany({
    include: { product: { select: { name: true, basePrice: true } } },
    orderBy: { createdAt: "desc" },
  });

  const options = variants.map((v) => {
    const unitPrice = Number(v.priceOverride ?? v.product.basePrice);
    const attrs = [v.size, v.color].filter(Boolean).join(" / ");
    return {
      id: v.id,
      unitPrice,
      label: `${v.product.name}${attrs ? ` — ${attrs}` : ""} (${unitPrice.toLocaleString("fr-FR")} XOF, stock: ${v.stock})`,
    };
  });

  return (
    <div className="mx-auto w-full max-w-270">
      <Breadcrumb pageName="Nouvelle commande" />
      <OrderForm variants={options} />
    </div>
  );
}
