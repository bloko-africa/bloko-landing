"use client";

import { banUserAccount, unbanUserAccount } from "@/lib/actions/users";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BanUserButton({ userId, banned }: { userId: string; banned: boolean }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUnban() {
    if (!confirm("Débannir ce compte ?")) return;
    setLoading(true);
    try {
      await notifyPromise(unbanUserAccount(userId), {
        loading: "Débannissement...",
        success: "Compte débanni",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleBan() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("userId", userId);
      formData.set("banReason", reason);
      await notifyPromise(banUserAccount(formData), {
        loading: "Bannissement...",
        success: "Compte banni",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (banned) {
    return (
      <button
        onClick={handleUnban}
        disabled={loading}
        className="text-body-sm text-primary hover:underline disabled:opacity-50"
      >
        Débannir
      </button>
    );
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison (optionnel)"
          className="w-32 rounded border border-stroke bg-transparent px-2 py-1 text-body-xs outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
        />
        <button
          onClick={handleBan}
          disabled={loading}
          className="text-body-sm text-red hover:underline disabled:opacity-50"
        >
          Confirmer
        </button>
        <button onClick={() => setShowForm(false)} className="text-body-sm text-dark-5 dark:text-dark-6">
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="text-body-sm text-red hover:underline"
    >
      Bannir
    </button>
  );
}
