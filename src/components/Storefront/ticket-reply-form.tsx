"use client";

import { replyToTicketAsBuyer } from "@/lib/actions/support-tickets";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", ticketId);
    setLoading(true);

    try {
      await notifyPromise(replyToTicketAsBuyer(formData), {
        loading: "Envoi...",
        success: "Message envoyé",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        name="body"
        rows={3}
        placeholder="Ton message"
        required
        maxLength={2000}
        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
      >
        Envoyer
      </button>
    </form>
  );
}
