"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { signUp } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { toast } from "sonner";

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionForm />
    </Suspense>
  );
}

function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/compte";
      const result = await signUp.email({ name, email, password });

      if (!result.data) {
        throw new Error(result.error?.message || "Inscription impossible");
      }

      router.push(callbackUrl);
      router.refresh();
      toast.success("Compte créé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-105 px-4 py-20">
      <h1 className="text-heading-6 font-medium text-dark dark:text-white">
        Créer un compte
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <InputGroup
          label="Nom"
          type="text"
          placeholder="Ton nom"
          name="name"
          value={name}
          handleChange={(e) => setName(e.target.value)}
          required
        />
        <InputGroup
          label="Email"
          type="email"
          placeholder="toi@email.com"
          name="email"
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputGroup
          label="Mot de passe"
          type="password"
          placeholder="8 caractères minimum"
          name="password"
          value={password}
          handleChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          Créer mon compte
        </button>
      </form>

      <p className="mt-6 text-center text-body-sm text-dark-5 dark:text-dark-6">
        Déjà un compte ?{" "}
        <Link href="/compte/connexion" className="font-medium text-primary">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
