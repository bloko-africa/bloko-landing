"use server";

import { db } from "@/lib/db";
import { requireRole, requireBoutiqueAccess } from "@/lib/auth/session";
import { uploadLivraisonProof } from "@/lib/storage/upload-product-image";
import { notifyUser } from "@/lib/push/send-push";
import { sendEmail } from "@/lib/email/send";
import { DeliveryUpdateEmail } from "@/lib/email/templates/delivery-update";
import { LIVRAISON_STATUS_LABEL } from "@/lib/livraison-status";
import { revalidateDashboardPath } from "@/lib/dashboard-space-server";
import { render } from "@react-email/render";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Étapes assez significatives pour interrompre l'acheteur sur son appareil —
// PRISE_EN_CHARGE reste visible dans la timeline mais ne justifie pas une
// notification à part (trop proche de A_ASSIGNER dans le vécu du client).
const NOTIFY_BUYER_ON: string[] = ["EN_ROUTE", "LIVREE", "ECHEC"];

const livraisonStatusSchema = z.enum([
  "A_ASSIGNER",
  "PRISE_EN_CHARGE",
  "EN_ROUTE",
  "LIVREE",
  "ECHEC",
  "RETOUR",
]);

const updateLivraisonSchema = z.object({
  id: z.string().min(1),
  agenceId: z.string().optional(),
  status: livraisonStatusSchema,
  trackingCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateLivraisonStatus(formData: FormData) {
  const id = formData.get("id")?.toString() ?? "";
  const livraison = await db.livraison.findUniqueOrThrow({
    where: { id },
    include: {
      order: {
        select: {
          boutiqueId: true,
          userId: true,
          reference: true,
          customerEmail: true,
          customerName: true,
          boutique: { select: { handle: true } },
        },
      },
    },
  });
  await requireBoutiqueAccess(
    ["viewer", "editor", "admin", "vendeur"],
    livraison.order.boutiqueId,
  );

  const data = updateLivraisonSchema.parse({
    id,
    agenceId: formData.get("agenceId")?.toString() || undefined,
    status: formData.get("status")?.toString() ?? "A_ASSIGNER",
    trackingCode: formData.get("trackingCode")?.toString() || undefined,
    notes: formData.get("notes")?.toString() || undefined,
  });

  const wasAssigned = Boolean(livraison.agenceId);
  const isNowDelivered = data.status === "LIVREE";

  const proofFile = formData.get("proof");
  const proof =
    proofFile instanceof File && proofFile.size > 0
      ? await uploadLivraisonProof(proofFile, livraison.orderId)
      : null;

  await db.livraison.update({
    where: { id },
    data: {
      agenceId: data.agenceId ?? null,
      status: data.status,
      trackingCode: data.trackingCode,
      notes: data.notes,
      assignedAt: !wasAssigned && data.agenceId ? new Date() : undefined,
      deliveredAt: isNowDelivered && !livraison.deliveredAt ? new Date() : undefined,
      ...(proof ? { proofUrl: proof.url } : {}),
    },
  });

  if (data.status !== livraison.status && NOTIFY_BUYER_ON.includes(data.status)) {
    const orderUrl = `/b/${livraison.order.boutique.handle}/compte/commandes/${livraison.orderId}`;

    if (livraison.order.userId) {
      await notifyUser(livraison.order.userId, {
        title: LIVRAISON_STATUS_LABEL[data.status] ?? data.status,
        body: `Commande ${livraison.order.reference} — ${LIVRAISON_STATUS_LABEL[data.status]?.toLowerCase() ?? data.status}.`,
        url: orderUrl,
      });
    }

    if (livraison.order.customerEmail) {
      await sendEmail({
        to: livraison.order.customerEmail,
        subject: `Commande ${livraison.order.reference} — ${LIVRAISON_STATUS_LABEL[data.status]?.toLowerCase() ?? data.status}`,
        category: "livraison",
        html: await render(
          DeliveryUpdateEmail({
            reference: livraison.order.reference,
            status: data.status,
            orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}${orderUrl}`,
          }),
        ),
      });
    }
  }

  revalidateDashboardPath("/livraisons");
  revalidateDashboardPath(`/livraisons/${id}`);
}

const agenceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  zones: z.string().optional(),
  isActive: z.boolean(),
});

function parseZones(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((z) => z.trim())
    .filter(Boolean);
}

export async function createAgence(formData: FormData) {
  await requireRole(["admin"]);
  const data = agenceSchema.parse({
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() || undefined,
    zones: formData.get("zones")?.toString() || undefined,
    isActive: formData.get("isActive") === "on",
  });

  await db.agence.create({
    data: {
      name: data.name,
      phone: data.phone,
      zones: parseZones(data.zones),
      isActive: data.isActive,
    },
  });

  revalidatePath("/2558588dca9a/agences");
}

export async function updateAgence(formData: FormData) {
  await requireRole(["admin"]);
  const data = agenceSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() || undefined,
    zones: formData.get("zones")?.toString() || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!data.id) throw new Error("id manquant");

  await db.agence.update({
    where: { id: data.id },
    data: {
      name: data.name,
      phone: data.phone,
      zones: parseZones(data.zones),
      isActive: data.isActive,
    },
  });

  revalidatePath("/2558588dca9a/agences");
}

export async function deleteAgence(id: string) {
  await requireRole(["admin"]);
  // SetNull sur Livraison.agenceId : supprimer une agence ne supprime pas
  // l'historique de livraison, juste le rattachement.
  await db.agence.delete({ where: { id } });
  revalidatePath("/2558588dca9a/agences");
}
