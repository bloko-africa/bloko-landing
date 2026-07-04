"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { signIn } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { toast } from "sonner";

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/compte";
      const result = await signIn.email({ email, password });

      if (!result.data) {
        throw new Error(result.error?.message || "Connexion impossible");
      }

      router.push(callbackUrl);
      router.refresh();
      toast.success("Connecté");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-105 px-4 py-20">
      <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
        Connexion
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
          placeholder="••••••••"
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
          Se connecter
        </button>
      </form>

      <p className="mt-6 text-center text-body-sm text-dark-5 dark:text-dark-6">
        Pas encore de compte ?{" "}
        <Link href="/compte/inscription" className="font-medium text-primary">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
