"use client";

import { createReview } from "@/lib/actions/reviews";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function Star({ filled, onClick, onMouseEnter }: { filled: boolean; onClick: () => void; onMouseEnter: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="p-0.5 text-dark dark:text-white"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z" />
      </svg>
    </button>
  );
}

export function ReviewForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) return;
    const formData = new FormData(e.currentTarget);
    formData.set("orderId", orderId);
    formData.set("rating", String(rating));
    setLoading(true);

    try {
      await notifyPromise(createReview(formData), {
        loading: "Envoi de ton avis...",
        success: "Merci pour ton avis !",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-stroke p-6 dark:border-dark-3">
      <p className="text-body-sm font-medium text-dark dark:text-white">
        Comment s&apos;est passée ta commande ?
      </p>
      <div className="mt-3 flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            filled={n <= (hover || rating)}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
          />
        ))}
      </div>
      <textarea
        name="comment"
        rows={3}
        placeholder="Un mot sur la qualité, le délai... (optionnel)"
        className="mt-4 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-body-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
      >
        Envoyer mon avis
      </button>
    </form>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex text-dark dark:text-white">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z" />
        </svg>
      ))}
    </div>
  );
}
