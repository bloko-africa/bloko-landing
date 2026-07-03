"use client";

import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteRowButtonProps = {
  confirmMessage: string;
  onDelete: () => Promise<unknown>;
  successMessage?: string;
};

export function DeleteRowButton({
  confirmMessage,
  onDelete,
  successMessage = "Supprimé",
}: DeleteRowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);

    try {
      await notifyPromise(onDelete(), {
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
