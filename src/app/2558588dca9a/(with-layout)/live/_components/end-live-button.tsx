"use client";

import { endLiveSession } from "@/lib/actions/live-sessions";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EndLiveButton({ liveSessionId }: { liveSessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Terminer ce live ?")) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("id", liveSessionId);
      await notifyPromise(endLiveSession(formData), {
        loading: "Fin du live...",
        success: "Live terminé",
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
      className="rounded-lg border border-red px-4 py-2 text-body-sm font-medium text-red hover:bg-red hover:text-white disabled:opacity-50"
    >
      Terminer le live
    </button>
  );
}
