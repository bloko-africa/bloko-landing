"use client";

import { CountrySelect } from "@/components/country-select";
import InputGroup from "@/components/FormElements/InputGroup";
import { useSession } from "@/lib/auth/auth-client";
import { checkout } from "@/lib/actions/checkout";
import { useCart } from "@/lib/cart/cart-context";
import { useBoutiquePath } from "@/lib/boutique-path";
import { formatPrice } from "@/lib/format-price";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export function CheckoutForm({
  currency,
  boutiqueHandle,
  deliveryFee,
  deliveryFeeMode,
  deliveryDetails,
}: {
  currency: string;
  boutiqueHandle: string;
  deliveryFee: number;
  deliveryFeeMode: string;
  deliveryDetails: string | null;
}) {
  const { items, totalPrice, clear } = useCart();
  const amountToCharge = totalPrice + (deliveryFeeMode === "INCLUS" ? deliveryFee : 0);
  const session = useSession();
  const isLoggedIn = Boolean(session.data?.user);
  const produitsPath = useBoutiquePath("/produits");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("CI");
  const [loading, setLoading] = useState(false);

  const effectiveEmail = isLoggedIn ? session.data?.user.email ?? "" : email;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--breakpoint-md) px-4 py-20 text-center">
        <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
          Ton panier est vide
        </h1>
        <Link
          href={produitsPath}
          className="mt-6 inline-block bg-dark px-8 py-3 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await checkout({
        boutiqueHandle,
        email: effectiveEmail,
        customerName: name,
        customerPhone: phone,
        country,
        items: items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      clear();
      window.location.href = result.checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "La commande a échoué");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
        Finaliser la commande
      </h1>

      <div className="mt-8 space-y-3 rounded-lg border border-stroke p-4 dark:border-dark-3">
        {items.map((item) => (
          <div key={item.variantId} className="flex justify-between text-body-sm">
            <span className="text-dark dark:text-white">
              {item.productName}
              {item.size || item.color
                ? ` (${[item.size, item.color].filter(Boolean).join(" / ")})`
                : ""}{" "}
              × {item.quantity}
            </span>
            <span className="text-dark-5 dark:text-dark-6">
              {formatPrice(item.unitPrice * item.quantity, currency)}
            </span>
          </div>
        ))}
        {deliveryFeeMode === "INCLUS" && deliveryFee > 0 && (
          <div className="flex justify-between border-t border-stroke pt-3 text-dark-5 dark:border-dark-3 dark:text-dark-6">
            <span>Livraison</span>
            <span>{formatPrice(deliveryFee, currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-stroke pt-3 font-medium text-dark dark:border-dark-3 dark:text-white">
          <span>Total à payer</span>
          <span>{formatPrice(amountToCharge, currency)}</span>
        </div>
        {deliveryFeeMode === "A_LA_CHARGE_DU_CLIENT" && (
          <p className="text-body-xs text-dark-5 dark:text-dark-6">
            {deliveryFee > 0
              ? `+ ${formatPrice(deliveryFee, currency)} de livraison, à payer en espèces à la réception`
              : "Livraison à régler directement avec le livreur, hors paiement en ligne"}
          </p>
        )}
        {deliveryDetails && (
          <p className="rounded-lg bg-gray-1 p-3 text-body-xs text-dark-5 dark:bg-dark-2 dark:text-dark-6">
            {deliveryDetails}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {!isLoggedIn && (
          <div>
            <InputGroup
              label="Email"
              type="email"
              placeholder="toi@email.com"
              name="email"
              value={email}
              handleChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="mt-1.5 text-body-xs text-dark-5 dark:text-dark-6">
              Aucun mot de passe requis — tu pourras suivre ta commande depuis
              cet email juste après le paiement.
            </p>
          </div>
        )}

        <InputGroup
          label="Nom complet"
          type="text"
          placeholder="Ton nom"
          name="name"
          value={name}
          handleChange={(e) => setName(e.target.value)}
          required
        />
        <InputGroup
          label="Téléphone"
          type="tel"
          placeholder="Ex: +2250700000000"
          name="phone"
          value={phone}
          handleChange={(e) => setPhone(e.target.value)}
          required
        />

        <CountrySelect
          label="Pays de livraison"
          value={country}
          onChange={setCountry}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dark py-3.5 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 disabled:opacity-70 dark:bg-white dark:text-dark"
        >
          {loading ? "Redirection vers le paiement..." : "Payer maintenant"}
        </button>
      </form>
    </div>
  );
}
