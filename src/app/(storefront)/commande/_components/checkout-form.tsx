"use client";

import { CountrySelect } from "@/components/country-select";
import InputGroup from "@/components/FormElements/InputGroup";
import { useSession } from "@/lib/auth/auth-client";
import { checkout } from "@/lib/actions/checkout";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format-price";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export function CheckoutForm({ currency }: { currency: string }) {
  const { items, totalPrice, clear } = useCart();
  const session = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("CI");
  const [loading, setLoading] = useState(false);

  const prefilledName = name || session.data?.user.name || "";
  const prefilledEmail = email || session.data?.user.email || "";

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--breakpoint-md) px-4 py-20 text-center">
        <h1 className="text-heading-6 font-medium text-dark dark:text-white">
          Ton panier est vide
        </h1>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90"
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
        customerName: prefilledName,
        customerPhone: phone,
        customerEmail: prefilledEmail,
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
      <h1 className="text-heading-6 font-medium text-dark dark:text-white">
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
        <div className="flex justify-between border-t border-stroke pt-3 font-medium text-dark dark:border-dark-3 dark:text-white">
          <span>Total</span>
          <span>{formatPrice(totalPrice, currency)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <InputGroup
          label="Nom complet"
          type="text"
          placeholder="Ton nom"
          name="name"
          value={prefilledName}
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
        <InputGroup
          label="Email (optionnel)"
          type="email"
          placeholder="toi@email.com"
          name="email"
          value={prefilledEmail}
          handleChange={(e) => setEmail(e.target.value)}
        />

        <CountrySelect
          label="Pays de livraison"
          value={country}
          onChange={setCountry}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-3.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          {loading ? "Redirection vers le paiement..." : "Payer maintenant"}
        </button>
      </form>
    </div>
  );
}
