"use client";

import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteRowButtonProps = {
  id: string;
  action: (id: string) => Promise<unknown>;
  confirmMessage: string;
  successMessage?: string;
};

export function DeleteRowButton({
  id,
  action,
  confirmMessage,
  successMessage = "Supprimé",
}: DeleteRowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);

    try {
      await notifyPromise(action(id), {
        loading: "Suppression...",
        success: successMessage,
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-body-sm text-red hover:underline disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
