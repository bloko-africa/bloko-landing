"use client";

import { changeUserRole } from "@/lib/actions/users";
import { notifyPromise } from "@/lib/notify-promise";
import { ASSIGNABLE_STAFF_ROLES, USER_ROLE_LABEL } from "@/lib/user-role";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";

export function RoleSelectForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("userId", userId);
      formData.set("role", role);
      await notifyPromise(changeUserRole(formData), {
        loading: "Mise à jour...",
        success: "Rôle mis à jour",
        error: (err) => (err instanceof Error ? err.message : "Échec"),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={loading}
      className="rounded-lg border border-stroke bg-transparent px-3 py-1.5 text-body-sm outline-none focus:border-primary disabled:opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
    >
      {ASSIGNABLE_STAFF_ROLES.map((role) => (
        <option key={role} value={role}>
          {USER_ROLE_LABEL[role]}
        </option>
      ))}
    </select>
  );
}
