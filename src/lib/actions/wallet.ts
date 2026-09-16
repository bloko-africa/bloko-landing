"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { getWalletSummary } from "@/lib/wallet";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PAYOUT_METHODS = ["mobile_money", "virement", "especes", "autre"] as const;

const recordPayoutSchema = z.object({
  boutiqueId: z.string().min(1),
  amount: z.coerce.number().positive("Montant invalide"),
  method: z.enum(PAYOUT_METHODS),
  reference: z.string().optional(),
  note: z.string().optional(),
});

/**
 * Règle d'intégrité : seul un admin peut enregistrer un versement — jamais
 * la vendeuse elle-même (sinon elle pourrait gonfler son solde payé et
 * fausser ce qu'elle a réellement reçu). L'argent réel ne bouge nulle part
 * ici : ce n'est qu'une trace de ce qui a été viré/remis en dehors de
 * l'app, après vérification côté GeniusPay/compte plateforme par l'admin.
 */
export async function recordPayout(formData: FormData) {
  const session = await requireRole(["admin"]);

  const data = recordPayoutSchema.parse({
    boutiqueId: formData.get("boutiqueId")?.toString() ?? "",
    amount: formData.get("amount")?.toString() ?? "0",
    method: formData.get("method")?.toString() ?? "autre",
    reference: formData.get("reference")?.toString() || undefined,
    note: formData.get("note")?.toString() || undefined,
  });

  const summary = await getWalletSummary(data.boutiqueId);
  if (data.amount > summary.balance) {
    throw new Error(
      `Montant supérieur au solde dû (${summary.balance.toLocaleString("fr-FR")} ${summary.currency}).`,
    );
  }

  await db.payoutRecord.create({
    data: {
      boutiqueId: data.boutiqueId,
      amount: data.amount,
      currency: summary.currency,
      method: data.method,
      reference: data.reference,
      note: data.note,
      recordedById: session.user.id,
    },
  });

  revalidatePath("/2558588dca9a/boutiques");
  revalidatePath(`/2558588dca9a/boutiques/${data.boutiqueId}`);
  revalidatePath("/2558588dca9a/wallet");
}
