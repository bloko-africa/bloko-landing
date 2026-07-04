import "server-only";

const BASE_URL = process.env.GENIUSPAY_BASE_URL;
const API_KEY = process.env.GENIUSPAY_API_KEY;
const API_SECRET = process.env.GENIUSPAY_API_SECRET;

function assertConfigured() {
  if (!BASE_URL || !API_KEY || !API_SECRET) {
    throw new Error(
      "GeniusPay n'est pas configuré (GENIUSPAY_BASE_URL / GENIUSPAY_API_KEY / GENIUSPAY_API_SECRET manquants).",
    );
  }
}

function headers() {
  return {
    "X-API-Key": API_KEY!,
    "X-API-Secret": API_SECRET!,
    "Content-Type": "application/json",
  };
}

export type GeniusPayCustomer = {
  name: string;
  email?: string;
  phone: string;
  country: string; // code ISO2, ex: "CI", "BJ"
};

export type CreatePaymentInput = {
  amount: number; // XOF, minimum 200
  currency?: string; // défaut XOF
  description?: string;
  customer: GeniusPayCustomer;
  paymentMethod?:
    | "wave"
    | "orange_money"
    | "mtn_money"
    | "moov_money"
    | "airtel_money"
    | "pawapay"
    | "paystack"
    | "card";
  successUrl?: string;
  errorUrl?: string;
  metadata?: Record<string, unknown>;
};

export type GeniusPayPayment = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "expired"
    | "cancelled"
    | "refunded";
  checkout_url: string;
  payment_url: string;
  environment: "sandbox" | "live";
  expires_at: string | null;
};

async function geniusPayFetch<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  assertConfigured();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers(), ...init.headers },
  });

  const rawBody = await response.text();
  let body: { success?: boolean; data?: T; message?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    // L'API a repondu avec du HTML (page d'erreur, compte non active, etc.)
    // au lieu de JSON — on evite de planter avec une SyntaxError opaque.
    throw new Error(
      `GeniusPay ${path} a renvoyé une réponse invalide (${response.status}). Vérifie que le compte marchand est bien activé.`,
    );
  }

  if (!response.ok || body.success === false) {
    throw new Error(
      `GeniusPay ${path} a échoué (${response.status}): ${body.message ?? JSON.stringify(body)}`,
    );
  }

  return body.data as T;
}

export async function createGeniusPayPayment(
  input: CreatePaymentInput,
): Promise<GeniusPayPayment> {
  return geniusPayFetch<GeniusPayPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? "XOF",
      description: input.description,
      payment_method: input.paymentMethod,
      customer: input.customer,
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: input.metadata,
    }),
  });
}

export async function getGeniusPayPaymentStatus(
  reference: string,
): Promise<GeniusPayPayment> {
  return geniusPayFetch<GeniusPayPayment>(
    `/payments/${encodeURIComponent(reference)}`,
    { method: "GET" },
  );
}
