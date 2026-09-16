"use client";

import {
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/actions/push-subscription";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationsToggle({
  description = "Reçois une alerte sur cet appareil à chaque nouvelle commande.",
}: {
  description?: string;
} = {}) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => {});
  }, []);

  async function handleEnable() {
    if (!VAPID_PUBLIC_KEY) {
      toast.error("Notifications push non configurées côté serveur.");
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permission refusée.");
        return;
      }

      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      // register() peut resoudre avant que le SW soit "active" — pushManager
      // exige un SW actif, d'ou l'attente explicite de `ready`.
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await subscribeToPush(subscription.toJSON());
      setSubscribed(true);
      toast.success("Notifications activées sur cet appareil.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible d'activer les notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      toast.success("Notifications désactivées sur cet appareil.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <p className="text-body-sm text-dark-5 dark:text-dark-6">
        Les notifications push ne sont pas supportées par ce navigateur.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-body-sm font-medium text-dark dark:text-white">
          Notifications push
        </p>
        <p className="text-body-xs text-dark-5 dark:text-dark-6">{description}</p>
      </div>

      <button
        type="button"
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={loading}
        className={
          subscribed
            ? "rounded-lg border border-red px-4 py-2 text-body-sm font-medium text-red hover:bg-red hover:text-white disabled:opacity-70"
            : "rounded-lg bg-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        }
      >
        {subscribed ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}
