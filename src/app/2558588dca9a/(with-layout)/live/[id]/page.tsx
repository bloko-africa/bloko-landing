import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EndLiveButton } from "../_components/end-live-button";
import { LiveCounter } from "../_components/live-counter";
import { LiveOrderFeed } from "../_components/live-order-feed";

export const metadata: Metadata = { title: "Live en cours" };
export const dynamic = "force-dynamic";

export default async function LiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const liveSession = await db.liveSession.findUnique({
    where: { id },
    include: {
      products: { include: { product: { select: { name: true } } } },
      orders: {
        where: { status: "PAID" },
        select: { totalAmount: true, currency: true },
      },
      _count: { select: { orders: true } },
    },
  });
  if (!liveSession) notFound();

  await requireBoutiqueAccess(["admin", "editor", "vendeur"], liveSession.boutiqueId);

  const isEnded = liveSession.status === "TERMINE";
  const revenue = liveSession.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const currency = liveSession.orders[0]?.currency ?? "XOF";

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName={isEnded ? "Live terminé" : "Live en cours"} />

      <ShowcaseSection title="Session live" className="p-6.5!">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {isEnded ? (
              <div>
                <p className="text-body-sm text-dark-5 dark:text-dark-6">Bilan du live</p>
                <p className="text-heading-6 font-bold text-dark dark:text-white">
                  {liveSession._count.orders} commande(s) — {formatPrice(revenue, currency)}
                </p>
              </div>
            ) : (
              <LiveCounter startedAt={liveSession.startedAt.toISOString()} />
            )}
            <p className="mt-2 text-body-xs text-dark-5 dark:text-dark-6">
              Produits en vente :{" "}
              {liveSession.products.map((p) => p.product.name).join(", ")}
            </p>
          </div>
          {!isEnded && <EndLiveButton liveSessionId={liveSession.id} />}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Commandes" className="p-6.5!">
        <LiveOrderFeed liveSessionId={liveSession.id} isEnded={isEnded} />
      </ShowcaseSection>
    </div>
  );
}
