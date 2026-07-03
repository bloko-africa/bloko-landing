import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_TIMESTAMP_DRIFT_SECONDS = 300; // anti-rejeu, imposé par la doc GeniusPay

/**
 * Formule GeniusPay : HMAC-SHA256(timestamp + "." + rawBody, webhookSecret).
 * rawBody doit être le corps brut de la requête (pas re-sérialisé), sinon la
 * signature ne correspond jamais.
 */
export function verifyGeniusPayWebhook(params: {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
}): { valid: boolean; reason?: string } {
  const { rawBody, signature, timestamp } = params;
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;

  if (!secret) {
    return { valid: false, reason: "GENIUSPAY_WEBHOOK_SECRET non configuré" };
  }
  if (!signature || !timestamp) {
    return { valid: false, reason: "en-têtes de signature manquants" };
  }

  const timestampSeconds = Number(timestamp);
  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(Date.now() / 1000 - timestampSeconds) > MAX_TIMESTAMP_DRIFT_SECONDS
  ) {
    return { valid: false, reason: "timestamp expiré ou invalide (anti-rejeu)" };
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { valid: false, reason: "signature invalide" };
  }

  return { valid: true };
}
