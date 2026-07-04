"use client";

import { CountrySelect } from "@/components/country-select";
import InputGroup from "@/components/FormElements/InputGroup";
import { signIn, useSession } from "@/lib/auth/auth-client";
import { checkEmailExists } from "@/lib/actions/check-email";
import { checkout } from "@/lib/actions/checkout";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format-price";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

export function CheckoutForm({ currency }: { currency: string }) {
  const { items, totalPrice, clear } = useCart();
  const session = useSession();
  const isLoggedIn = Boolean(session.data?.user);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("CI");
  const [loading, setLoading] = useState(false);

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailIsNew, setEmailIsNew] = useState<boolean | null>(null);
  const checkSeq = useRef(0);

  useEffect(() => {
    if (isLoggedIn) return;
    if (!email || !email.includes("@")) {
      setEmailIsNew(null);
      return;
    }

    const seq = ++checkSeq.current;
    setCheckingEmail(true);
    const timeout = setTimeout(async () => {
      try {
        const exists = await checkEmailExists(email);
        if (checkSeq.current === seq) setEmailIsNew(!exists);
      } finally {
        if (checkSeq.current === seq) setCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [email, isLoggedIn]);

  const effectiveEmail = isLoggedIn ? session.data?.user.email ?? "" : email;
  const needsPassword = !isLoggedIn && emailIsNew === true;

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
        email: effectiveEmail,
        password: needsPassword ? password : undefined,
        customerName: name,
        customerPhone: phone,
        country,
        items: items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      // Compte cree a l'instant -> etablir la session cote client avant de
      // partir vers le paiement, pour que le retour soit deja connecte.
      if (needsPassword) {
        await signIn.email({ email: effectiveEmail, password }).catch(() => {});
      }

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
            {checkingEmail && (
              <p className="mt-1.5 text-body-xs text-dark-5 dark:text-dark-6">
                Vérification...
              </p>
            )}
            {!checkingEmail && emailIsNew === false && (
              <p className="mt-1.5 text-body-xs text-green-dark">
                Compte existant — pas besoin de mot de passe, ta commande sera
                associée à cet email.
              </p>
            )}
            {!checkingEmail && emailIsNew === true && (
              <p className="mt-1.5 text-body-xs text-dark-5 dark:text-dark-6">
                Nouveau client — choisis un mot de passe pour créer ton compte
                et suivre tes commandes.
              </p>
            )}
          </div>
        )}

        {needsPassword && (
          <InputGroup
            label="Mot de passe"
            type="password"
            placeholder="8 caractères minimum"
            name="password"
            value={password}
            handleChange={(e) => setPassword(e.target.value)}
            required
          />
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
          disabled={loading || checkingEmail}
          className="w-full rounded-full bg-primary py-3.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          {loading ? "Redirection vers le paiement..." : "Payer maintenant"}
        </button>
      </form>
    </div>
  );
}
