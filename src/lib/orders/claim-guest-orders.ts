import "server-only";
import { db } from "@/lib/db";

/**
 * Rattache au compte les commandes "invitées" (payées sans compte au
 * checkout, userId null) passées avec le même email — toutes boutiques
 * confondues. C'est ce qui rend le compte acheteur utile d'une boutique à
 * l'autre : une seule connexion (lien magique, code ou mot de passe)
 * retrouve tout l'historique, peu importe où la commande a été passée.
 * Idempotent, appelé à chaque visite authentifiée d'une page compte.
 */
export async function claimGuestOrders(userId: string, email: string) {
  await db.order.updateMany({
    where: { userId: null, customerEmail: email },
    data: { userId },
  });
}
