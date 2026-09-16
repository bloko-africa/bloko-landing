"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Select } from "@/components/FormElements/select";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { replyToTicket } from "@/lib/actions/support-tickets";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const STATUS_OPTIONS = [
  { value: "OUVERT", label: "Ouvert" },
  { value: "EN_COURS", label: "En cours" },
  { value: "RESOLU", label: "Résolu" },
  { value: "FERME", label: "Fermé" },
];

export function TicketReplyForm({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", ticketId);
    setLoading(true);

    try {
      await notifyPromise(replyToTicket(formData), {
        loading: "Envoi...",
        success: "Ticket mis à jour",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection title="Répondre" className="space-y-5.5 p-6.5!">
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <Select label="Statut" name="status" items={STATUS_OPTIONS} defaultValue={currentStatus} />

        <TextAreaGroup label="Réponse (optionnel)" name="body" placeholder="Ta réponse à la cliente" />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          Enregistrer
        </button>
      </form>
    </ShowcaseSection>
  );
}
