import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { requireBoutiqueAccess } from "@/lib/auth/session";
import { VENDOR_BASE } from "@/lib/dashboard-space";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LiveChecklistForm } from "./_components/live-checklist-form";

export const metadata: Metadata = { title: "Live" };
export const dynamic = "force-dynamic";

export default async function LivePage() {
  // Démarrer un live n'a de sens que pour une vendeuse précise — pas de cas
  // d'usage légitime pour le staff plateforme (qui gère plusieurs boutiques,
  // pas "sa" boutique). admin/editor étaient acceptés ici mais provoquaient
  // un crash immédiat juste après (scopedBoutiqueId toujours undefined pour
  // eux) : symptôme du mélange entre statut superadmin et statut vendeuse.
  const { scopedBoutiqueId } = await requireBoutiqueAccess(["vendeur"]);

  const activeSession = await db.liveSession.findFirst({
    where: { boutiqueId: scopedBoutiqueId, status: "EN_COURS" },
    select: { id: true },
  });
  if (activeSession) {
    redirect(`${VENDOR_BASE}/live/${activeSession.id}`);
  }

  const [products, pastSessions] = await Promise.all([
    db.product.findMany({
      where: { boutiqueId: scopedBoutiqueId, status: "PUBLISHED" },
      orderBy: { name: "asc" },
      include: { variants: { select: { stock: true } } },
    }),
    db.liveSession.findMany({
      where: { boutiqueId: scopedBoutiqueId, status: "TERMINE" },
      orderBy: { startedAt: "desc" },
      take: 30,
      include: {
        _count: { select: { orders: true } },
        orders: { where: { status: "PAID" }, select: { totalAmount: true, currency: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName="Live" />

      <LiveChecklistForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
        }))}
      />

      {pastSessions.length > 0 && (
        <div>
          <h2 className="mb-4 text-body-lg font-medium text-dark dark:text-white">
            Mes lives
          </h2>
          <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-stroke text-left dark:border-dark-3">
                  <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Date</th>
                  <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Durée</th>
                  <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Commandes</th>
                  <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Revenu</th>
                  <th className="px-5.5 py-4 font-medium text-dark dark:text-white"></th>
                </tr>
              </thead>
              <tbody>
                {pastSessions.map((s) => {
                  const durationMin = s.endedAt
                    ? Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60000)
                    : 0;
                  const revenue = s.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
                  const currency = s.orders[0]?.currency ?? "XOF";
                  return (
                    <tr key={s.id} className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2">
                      <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                        {s.startedAt.toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">{durationMin} min</td>
                      <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">{s._count.orders}</td>
                      <td className="px-5.5 py-4 font-medium text-dark dark:text-white">
                        {formatPrice(revenue, currency)}
                      </td>
                      <td className="px-5.5 py-4">
                        <Link
                          href={`${VENDOR_BASE}/live/${s.id}`}
                          className="text-body-sm text-dark-5 hover:text-primary dark:text-dark-6"
                        >
                          Détail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
