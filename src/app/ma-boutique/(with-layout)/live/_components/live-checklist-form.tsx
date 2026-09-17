"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { startLiveSession } from "@/lib/actions/live-sessions";
import { VENDOR_BASE } from "@/lib/dashboard-space";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Product = { id: string; name: string; stock: number };

export function LiveChecklistForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      const result = await notifyPromise(startLiveSession(formData), {
        loading: "Démarrage...",
        success: "Live démarré",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.push(`${VENDOR_BASE}/live/${result.liveSessionId}`);
    } catch (err) {
      // Course avec un autre onglet/appareil qui a démarré le live entre
      // temps : plutôt que de laisser un formulaire mort, on renvoie vers
      // /live qui redirige déjà lui-même vers la session active.
      if (err instanceof Error && err.message.includes("déjà en cours")) {
        router.push(`${VENDOR_BASE}/live`);
        return;
      }
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection title="Démarrer un live" className="space-y-5.5 p-6.5!">
      {products.length === 0 ? (
        <p className="text-body-sm text-dark-5 dark:text-dark-6">
          Aucun produit publié — publie au moins un produit avant de démarrer un live.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5.5">
          <p className="text-body-sm text-dark-5 dark:text-dark-6">
            Sélectionne ce que tu vends aujourd&apos;hui.
          </p>
          <div className="max-h-100 space-y-1 overflow-y-auto rounded-lg border border-stroke p-3 dark:border-dark-3">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-1 dark:hover:bg-dark-2"
              >
                <span className="flex items-center gap-3">
                  <input type="checkbox" name="productIds" value={product.id} className="size-4" />
                  <span className="text-body-sm text-dark dark:text-white">{product.name}</span>
                </span>
                <span className="text-body-xs text-dark-5 dark:text-dark-6">
                  Stock : {product.stock}
                </span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
          >
            Démarrer le live
          </button>
        </form>
      )}
    </ShowcaseSection>
  );
}
