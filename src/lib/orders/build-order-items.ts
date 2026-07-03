import "server-only";
import { db } from "@/lib/db";

export type OrderItemInput = { productVariantId: string; quantity: number };

/**
 * Resolves order line items against live DB prices/stock — never trust a
 * client-submitted price. Throws if a variant is missing or under-stocked.
 */
export async function buildOrderItems(items: OrderItemInput[]) {
  const variants = await db.productVariant.findMany({
    where: { id: { in: items.map((i) => i.productVariantId) } },
    include: { product: { select: { basePrice: true, name: true } } },
  });

  let total = 0;
  const itemsData = items.map((item) => {
    const variant = variants.find((v) => v.id === item.productVariantId);
    if (!variant) throw new Error("Variante introuvable.");

    if (variant.stock < item.quantity) {
      const label = [variant.product.name, variant.size, variant.color]
        .filter(Boolean)
        .join(" ");
      throw new Error(`Stock insuffisant pour ${label} (${variant.stock} restant(s)).`);
    }

    const unitPrice = variant.priceOverride ?? variant.product.basePrice;
    total += Number(unitPrice) * item.quantity;

    return {
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPrice,
    };
  });

  return { itemsData, total };
}

/** Decremente le stock des variantes d'une commande — a appeler une seule
 * fois, au moment ou le paiement est confirme (pas a la creation de commande,
 * pour ne pas perdre du stock sur des paniers abandonnes). */
export async function decrementStockForOrder(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });

  await db.$transaction(
    items.map((item) =>
      db.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { decrement: item.quantity } },
      }),
    ),
  );
}
