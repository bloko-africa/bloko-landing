import "server-only";
import { db } from "@/lib/db";
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

const isConfigured = Boolean(publicKey && privateKey && subject);

if (isConfigured) {
  webpush.setVapidDetails(subject!, publicKey!, privateKey!);
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  // Notif "nouvelle commande" : limite l'envoi aux abonnés de CETTE
  // boutique (une vendeuse) + au staff plateforme (boutiqueId NULL, jamais
  // filtré). Omis = comportement historique, tout le monde reçoit.
  boutiqueId?: string;
};

/**
 * Envoie une notification push au staff abonne concerne. Best-effort : une
 * souscription expiree/invalide (410/404) est supprimee silencieusement,
 * les autres erreurs sont juste loggees pour ne jamais bloquer le flux
 * (creation de commande) sur un probleme de notification.
 */
export async function notifyStaff(payload: PushPayload): Promise<void> {
  if (!isConfigured) return;

  const subscriptions = await db.pushSubscription.findMany({
    where: payload.boutiqueId
      ? { user: { OR: [{ boutiqueId: null }, { boutiqueId: payload.boutiqueId }] } }
      : undefined,
  });
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("Echec envoi push:", error);
        }
      }
    }),
  );
}

/**
 * Envoie une notification push à UN acheteur (tous ses appareils abonnés) —
 * utilisé pour les mises à jour de livraison sur sa propre commande.
 * Best-effort, même logique de nettoyage des abonnements expirés que
 * notifyStaff.
 */
export async function notifyUser(userId: string, payload: PushPayload): Promise<void> {
  if (!isConfigured) return;

  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("Echec envoi push (acheteur):", error);
        }
      }
    }),
  );
}
