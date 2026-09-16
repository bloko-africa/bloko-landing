import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DEMO_ORDERS = [
  { name: "Awa Traoré", phone: "+2250700000001", country: "CI", status: "PAID" as const },
  { name: "Fatou Diallo", phone: "+2250700000002", country: "CI", status: "PAID" as const },
  { name: "Kokou Mensah", phone: "+22997000001", country: "BJ", status: "PAID" as const },
  { name: "Aïcha Bello", phone: "+22997000002", country: "BJ", status: "PENDING" as const },
  { name: "Sophie Martin", phone: "+33600000001", country: "FR", status: "PAID" as const },
  { name: "John Doe", phone: "+12025550123", country: "US", status: "PENDING" as const },
  { name: "Chinwe Okafor", phone: "+2348000000001", country: "NG", status: "PAID" as const },
];

async function main() {
  const variants = await db.productVariant.findMany({
    include: { product: { select: { basePrice: true, boutiqueId: true } } },
    take: 20,
  });

  if (variants.length === 0) {
    console.log("Aucune variante trouvee — lance d'abord `npm run db:seed`.");
    return;
  }

  console.log("Creation de commandes de demo...");

  for (const [index, demo] of DEMO_ORDERS.entries()) {
    const variant = variants[index % variants.length];
    const quantity = 1 + (index % 3);
    const unitPrice = Number(variant.priceOverride ?? variant.product.basePrice);

    const order = await db.order.create({
      data: {
        reference: `ORD-DEMO-${index + 1}`,
        boutiqueId: variant.product.boutiqueId,
        customerName: demo.name,
        customerPhone: demo.phone,
        country: demo.country,
        status: demo.status,
        totalAmount: unitPrice * quantity,
        currency: "XOF",
        items: {
          create: [
            {
              productVariantId: variant.id,
              quantity,
              unitPrice,
            },
          ],
        },
      },
    });

    console.log(`  ✔ ${order.reference} — ${demo.name} (${demo.country})`);
  }

  console.log("Termine.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
