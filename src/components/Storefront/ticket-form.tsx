"use client";

import { createTicket } from "@/lib/actions/support-tickets";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function TicketForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("orderId", orderId);
    setLoading(true);

    try {
      const result = await notifyPromise(createTicket(formData), {
        loading: "Envoi de ton message...",
        success: "Ticket ouvert",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.push(`/compte/tickets/${result.ticketId}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-stroke p-6 dark:border-dark-3">
      <p className="text-body-sm font-medium text-dark dark:text-white">Besoin d&apos;aide ?</p>
      <p className="mt-1 text-body-xs text-dark-5 dark:text-dark-6">
        Décris ton problème — la vendeuse te répond directement ici.
      </p>
      <input
        type="text"
        name="subject"
        placeholder="Sujet (ex : colis non reçu)"
        required
        maxLength={200}
        className="mt-4 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      <textarea
        name="body"
        rows={3}
        placeholder="Ton message"
        required
        maxLength={2000}
        className="mt-3 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-body-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
      >
        Envoyer
      </button>
    </form>
  );
}
