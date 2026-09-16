"use client";

import { sendCustomerMessage } from "@/lib/actions/customer-messages";
import { notifyPromise } from "@/lib/notify-promise";
import { useState, type FormEvent } from "react";

export function CustomerMessageForm({
  boutiqueId,
  recipientCount,
}: {
  boutiqueId: string;
  recipientCount: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (recipientCount === 0) return;
    if (
      !confirm(
        `Envoyer cet email à ${recipientCount} client${recipientCount > 1 ? "s" : ""} ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("boutiqueId", boutiqueId);
    setLoading(true);

    try {
      await notifyPromise(sendCustomerMessage(formData), {
        loading: "Envoi en cours...",
        success: "Message envoyé",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      (e.target as HTMLFormElement).reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-body-xs text-dark-5 dark:text-dark-6">
        {recipientCount === 0
          ? "Aucun client avec commande payée pour l'instant."
          : `Sera envoyé à ${recipientCount} client${recipientCount > 1 ? "s" : ""} (emails distincts, commandes payées).`}
      </p>
      <input
        name="subject"
        type="text"
        placeholder="Objet"
        required
        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      <textarea
        name="message"
        rows={6}
        placeholder="Ton message..."
        required
        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading || recipientCount === 0}
        className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
      >
        Envoyer
      </button>
    </form>
  );
}
