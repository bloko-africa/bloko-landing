"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Select } from "@/components/FormElements/select";
import InputGroup from "@/components/FormElements/InputGroup";
import { createStaffAccount } from "@/lib/actions/users";
import { notifyPromise } from "@/lib/notify-promise";
import { ASSIGNABLE_STAFF_ROLES, USER_ROLE_LABEL } from "@/lib/user-role";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const ROLE_OPTIONS = ASSIGNABLE_STAFF_ROLES.map((role) => ({
  value: role,
  label: USER_ROLE_LABEL[role],
}));

export function CreateStaffForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      await notifyPromise(createStaffAccount(formData), {
        loading: "Création...",
        success: "Compte créé",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.push("/2558588dca9a/users");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection title="Nouveau compte staff" className="space-y-5.5 p-6.5!">
      <form onSubmit={handleSubmit} className="space-y-5.5">
        <InputGroup label="Nom" name="name" type="text" placeholder="Nom complet" required />
        <InputGroup label="Email" name="email" type="email" placeholder="email@bloko.me" required />
        <InputGroup
          label="Mot de passe"
          name="password"
          type="password"
          placeholder="8 caractères minimum"
          required
        />
        <Select label="Rôle" name="role" items={ROLE_OPTIONS} defaultValue="viewer" />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          Créer le compte
        </button>
      </form>
    </ShowcaseSection>
  );
}
