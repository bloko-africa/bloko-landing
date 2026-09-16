"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { authClient, signIn } from "@/lib/auth/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import InputGroup from "../FormElements/InputGroup";

type Step = "start" | "magic-sent" | "otp" | "password" | "forgot" | "reset-otp";

/**
 * Connexion partagée admin/acheteuse : lien magique en premier (aucun mot
 * de passe à retenir), code à 6 chiffres en repli, mot de passe replié en
 * dernier recours. Le mot de passe oublié réutilise le même mécanisme de
 * code plutôt qu'un second flux "lien de reset" — un seul système d'email
 * à maintenir pour les deux besoins.
 */
export function AccessForm({
  callbackURL: defaultCallbackURL,
  newUserCallbackURL,
  defaultEmail = "",
}: {
  callbackURL: string;
  newUserCallbackURL?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackUrl") || defaultCallbackURL;
  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  function goToStart() {
    setStep("start");
    setOtp("");
    setPassword("");
    setNewPassword("");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn.magicLink({
        email,
        callbackURL,
        newUserCallbackURL: newUserCallbackURL ?? callbackURL,
      });
      if (result.error) throw new Error(result.error.message || "Échec de l'envoi");
      setStep("magic-sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi du lien");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (result.error) throw new Error(result.error.message || "Échec de l'envoi");
      setStep("otp");
      toast.success("Code envoyé par email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi du code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn.emailOtp({ email, otp });
      if (!result.data) throw new Error(result.error?.message || "Code invalide");
      toast.success("Connexion réussie");
      router.push(callbackURL);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (!result.data) throw new Error(result.error?.message || "Échec de la connexion");
      toast.success("Connexion réussie");
      router.push(callbackURL);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.emailOtp.requestPasswordReset({ email });
      if (result.error) throw new Error(result.error.message || "Échec de l'envoi");
      setStep("reset-otp");
      toast.success("Code envoyé par email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi du code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });
      if (result.error) throw new Error(result.error.message || "Code invalide");
      toast.success("Mot de passe mis à jour — connecte-toi");
      setOtp("");
      setPassword("");
      setNewPassword("");
      setStep("password");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  }

  if (step === "magic-sent") {
    return (
      <div className="rounded-lg border border-stroke bg-gray-1 p-5 text-center dark:border-dark-3 dark:bg-dark-2">
        <p className="text-body-md font-medium text-dark dark:text-white">
          Vérifie ta boîte mail
        </p>
        <p className="mt-2 text-body-sm text-dark-5 dark:text-dark-6">
          On a envoyé un lien de connexion à <strong>{email}</strong>. Clique
          dessus pour te connecter — il expire dans 5 minutes.
        </p>
        <button
          type="button"
          onClick={goToStart}
          className="mt-4 text-body-sm font-medium text-primary hover:underline"
        >
          ‹ Utiliser une autre adresse
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp}>
        <p className="mb-4 text-body-sm text-dark-5 dark:text-dark-6">
          Code envoyé à <strong>{email}</strong>.
        </p>
        <InputGroup
          type="text"
          label="Code à 6 chiffres"
          className="mb-5 [&_input]:py-3.75 [&_input]:tracking-[0.4em] [&_input]:text-center"
          placeholder="000000"
          name="otp"
          value={otp}
          handleChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Valider le code
        </button>
        <div className="flex items-center justify-between text-body-sm">
          <button type="button" onClick={goToStart} className="text-dark-5 hover:underline dark:text-dark-6">
            ‹ Retour
          </button>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="font-medium text-primary hover:underline"
          >
            Renvoyer le code
          </button>
        </div>
      </form>
    );
  }

  if (step === "forgot") {
    return (
      <form onSubmit={handleRequestPasswordReset}>
        <p className="mb-4 text-body-sm text-dark-5 dark:text-dark-6">
          On t&apos;envoie un code pour choisir un nouveau mot de passe.
        </p>
        <InputGroup
          type="email"
          label="Email"
          className="mb-5 [&_input]:py-3.75"
          placeholder="Adresse e-mail"
          name="email"
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          icon={<EmailIcon />}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Recevoir le code
        </button>
        <button
          type="button"
          onClick={() => setStep("password")}
          className="text-body-sm text-dark-5 hover:underline dark:text-dark-6"
        >
          ‹ Retour
        </button>
      </form>
    );
  }

  if (step === "reset-otp") {
    return (
      <form onSubmit={handleResetPassword}>
        <p className="mb-4 text-body-sm text-dark-5 dark:text-dark-6">
          Code envoyé à <strong>{email}</strong>.
        </p>
        <InputGroup
          type="text"
          label="Code à 6 chiffres"
          className="mb-4 [&_input]:py-3.75 [&_input]:tracking-[0.4em] [&_input]:text-center"
          placeholder="000000"
          name="otp"
          value={otp}
          handleChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
        <InputGroup
          type="password"
          label="Nouveau mot de passe"
          className="mb-5 [&_input]:py-3.75"
          placeholder="8 caractères minimum"
          name="newPassword"
          value={newPassword}
          handleChange={(e) => setNewPassword(e.target.value)}
          icon={<PasswordIcon />}
          required
        />
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Mettre à jour le mot de passe
        </button>
        <button
          type="button"
          onClick={goToStart}
          className="text-body-sm text-dark-5 hover:underline dark:text-dark-6"
        >
          ‹ Retour
        </button>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={handlePasswordSignIn}>
        <InputGroup
          type="email"
          label="Email"
          className="mb-4 [&_input]:py-3.75"
          placeholder="Adresse e-mail"
          name="email"
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          icon={<EmailIcon />}
          required
        />
        <InputGroup
          type="password"
          label="Mot de passe"
          className="mb-2 [&_input]:py-3.75"
          placeholder="Mot de passe"
          name="password"
          value={password}
          handleChange={(e) => setPassword(e.target.value)}
          icon={<PasswordIcon />}
          required
        />
        <button
          type="button"
          onClick={() => setStep("forgot")}
          className="mb-5 text-body-sm font-medium text-primary hover:underline"
        >
          Mot de passe oublié ?
        </button>
        <button
          type="submit"
          disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={goToStart}
          className="text-body-sm text-dark-5 hover:underline dark:text-dark-6"
        >
          ‹ Retour aux autres options
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleMagicLink}>
      <InputGroup
        type="email"
        label="Email"
        className="mb-5 [&_input]:py-3.75"
        placeholder="Adresse e-mail"
        name="email"
        value={email}
        handleChange={(e) => setEmail(e.target.value)}
        icon={<EmailIcon />}
        required
      />
      <button
        type="submit"
        disabled={loading || !email}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Recevoir un lien de connexion
      </button>
      <button
        type="button"
        onClick={handleSendOtp}
        disabled={loading || !email}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg border border-stroke p-4 font-medium text-dark transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-3 dark:text-white"
      >
        Recevoir un code par email
      </button>
      <p className="text-center text-body-sm text-dark-5 dark:text-dark-6">
        <button
          type="button"
          onClick={() => setStep("password")}
          className="font-medium text-primary hover:underline"
        >
          Se connecter avec un mot de passe
        </button>
      </p>
    </form>
  );
}
