import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { LogoutButton } from "./_logout-button";

export const metadata: Metadata = { title: "Mon compte" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  FAILED: "Échec du paiement",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export default async function AccountPage() {
  const session = await getCurrentSession();
  const user = session!.user;

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
            Bonjour {user.name}
          </h1>
          <p className="text-body-sm text-dark-5 dark:text-dark-6">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="mt-10 text-body-lg font-medium text-dark dark:text-white">
        Mes commandes
      </h2>

      {orders.length === 0 ? (
        <p className="mt-4 text-body-sm text-dark-5 dark:text-dark-6">
          Tu n'as pas encore passé de commande.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3"
            >
              <div>
                <p className="font-medium text-dark dark:text-white">
                  {order.reference}
                </p>
                <p className="text-body-sm text-dark-5 dark:text-dark-6">
                  {order.items.length} article(s) —{" "}
                  {Number(order.totalAmount).toLocaleString("fr-FR")} {order.currency}
                </p>
              </div>
              <span className="rounded-full bg-gray-2 px-3 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-2 dark:text-dark-6">
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
